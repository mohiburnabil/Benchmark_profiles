# backend/main.py
from fastapi import FastAPI, Depends, File, UploadFile, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func

from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
import pandas as pd
import shutil
import os
from backend import models, schemas, database, scoring
from backend.database import SessionLocal, engine
from datetime import datetime, timedelta
from typing import List

# Create DB tables
models.Base.metadata.create_all(bind=engine)

SECRET_KEY = "your_secret_key_here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Auth helpers
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

# Routes
@app.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter((models.User.username == user.username) | (models.User.email == user.email)).first():
        raise HTTPException(status_code=400, detail="Username or email already registered")
    hashed_password = get_password_hash(user.password)
    db_user = models.User(username=user.username, email=user.email, password_hash=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "User registered successfully"}

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user.username}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/upload")
def upload_result(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    with open(f"temp_{file.filename}", "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    try:
        score = scoring.score_csv(f"temp_{file.filename}")
    finally:
        os.remove(f"temp_{file.filename}")
    result = models.Result(user_id=current_user.id, score=score)
    db.add(result)
    db.commit()
    return {"score": score}

@app.get("/user/results", response_model=List[schemas.ResultOut])
def user_results(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Result).filter(models.Result.user_id == current_user.id).all()

@app.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    # Subquery to get max score per user
    subquery = (
        db.query(
            models.Result.user_id,
            func.max(models.Result.score).label("max_score")
        )
        .group_by(models.Result.user_id)
        .subquery()
    )

    # Join with User table to get usernames
    query = (
        db.query(
            models.User.username,
            subquery.c.max_score.label("score")
        )
        .join(subquery, models.User.id == subquery.c.user_id)
        .order_by(subquery.c.max_score.desc())
        .all()
    )

    # Convert query result to list of dicts
    leaderboard = [{"username": row.username, "score": row.score} for row in query]
    return leaderboard
