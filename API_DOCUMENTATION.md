# API Documentation

## Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "clx123abc...",
    "email": "user@example.com",
    "name": "John Doe",
    "subscriptionPlan": "FREE",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

**Errors:**
- `400`: Validation error or user already exists
- `500`: Internal server error

---

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "user": {
    "id": "clx123abc...",
    "email": "user@example.com",
    "name": "John Doe",
    "subscriptionPlan": "FREE"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

**Errors:**
- `401`: Invalid credentials
- `400`: Validation error

---

### Refresh Token
**POST** `/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGc..."
}
```

**Errors:**
- `401`: Invalid or expired refresh token

---

### Logout
**POST** `/auth/logout`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

## User Endpoints

### Get Current User
**GET** `/user/me`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "user": {
    "id": "clx123abc...",
    "email": "user@example.com",
    "name": "John Doe",
    "subscriptionPlan": "FREE",
    "scansUsedThisMonth": 2,
    "scansResetDate": "2024-02-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Resume Endpoints

### Upload Resume
**POST** `/resume/upload`

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body (Form Data):**
```
file: <resume.pdf> (or .docx)
```

**OR (Text Content):**
```
textContent: "Resume text content..."
```

**Response:** `201 Created`
```json
{
  "message": "Resume uploaded and parsed successfully",
  "resume": {
    "id": "clx456def...",
    "fileName": "resume.pdf",
    "skills": ["JavaScript", "React", "Node.js"],
    "parsedData": {
      "content": "Full resume text...",
      "skills": [...],
      "experience": [...],
      "education": [...],
      "projects": [...]
    }
  }
}
```

**Errors:**
- `400`: Invalid file type or size
- `403`: Scan limit reached
- `500`: Parsing error

---

### Get User Resumes
**GET** `/resume`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "resumes": [
    {
      "id": "clx456def...",
      "fileName": "resume.pdf",
      "fileType": "application/pdf",
      "fileSize": 124567,
      "skills": ["JavaScript", "React"],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "_count": {
        "atsScores": 3
      }
    }
  ]
}
```

---

## ATS Analysis Endpoints

### Analyze Resume
**POST** `/ats/analyze`

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "resumeId": "clx456def...",
  "jobDescription": {
    "title": "Senior Software Engineer",
    "company": "Tech Corp",
    "description": "We are looking for a senior software engineer with 5+ years of experience in React, Node.js, and AWS. Must have strong problem-solving skills...",
    "requiredSkills": ["React", "Node.js", "AWS"],
    "preferredSkills": ["TypeScript", "Docker"],
    "experience": "5+ years"
  }
}
```

**Response:** `200 OK`
```json
{
  "message": "ATS analysis completed successfully",
  "result": {
    "id": "clx789ghi...",
    "overallScore": 82,
    "componentScores": {
      "skills": 85,
      "experience": 78,
      "keywords": 80,
      "formatting": 90
    },
    "matched": {
      "skills": ["React", "Node.js", "JavaScript"],
      "keywords": ["software engineer", "problem-solving", "experience"]
    },
    "missing": {
      "skills": ["AWS"],
      "keywords": ["cloud", "devops"]
    },
    "aiAnalysis": {
      "strengths": [
        "Strong skill set with 15 identified skills",
        "Excellent keyword optimization",
        "Good use of quantifiable metrics"
      ],
      "weaknesses": [
        "Missing AWS certification",
        "Limited cloud experience details"
      ],
      "bulletPointQuality": {
        "score": 75,
        "feedback": ["Add measurable results to accomplishments"]
      },
      "languageQuality": {
        "score": 80,
        "feedback": ["Reduce passive voice usage"]
      },
      "impactAnalysis": {
        "hasQuantifiableResults": true,
        "examples": ["Increased sales by 25%"],
        "suggestions": []
      }
    },
    "suggestions": [
      "Add AWS to your skills section",
      "Include cloud infrastructure projects",
      "Quantify team leadership experience"
    ],
    "scansRemaining": 3
  }
}
```

**Errors:**
- `400`: Invalid request body
- `403`: Scan limit reached
- `404`: Resume not found
- `500`: Analysis error

---

### Get Analysis History
**GET** `/ats/history?limit=10&offset=0`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (optional): Number of results (default: 10)
- `offset` (optional): Pagination offset (default: 0)

**Response:** `200 OK`
```json
{
  "scores": [
    {
      "id": "clx789ghi...",
      "overallScore": 82,
      "skillsScore": 85,
      "experienceScore": 78,
      "keywordScore": 80,
      "formattingScore": 90,
      "createdAt": "2024-01-20T14:30:00.000Z",
      "resume": {
        "fileName": "resume.pdf"
      },
      "jobDescription": {
        "title": "Senior Software Engineer",
        "company": "Tech Corp"
      }
    }
  ],
  "pagination": {
    "total": 15,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### Get Specific ATS Score
**GET** `/ats/score/{id}`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "score": {
    "id": "clx789ghi...",
    "overallScore": 82,
    "skillsScore": 85,
    "experienceScore": 78,
    "keywordScore": 80,
    "formattingScore": 90,
    "matchedSkills": ["React", "Node.js"],
    "missingSkills": ["AWS"],
    "matchedKeywords": ["software", "engineer"],
    "missingKeywords": ["cloud"],
    "suggestions": [...],
    "createdAt": "2024-01-20T14:30:00.000Z",
    "resume": {
      "id": "clx456def...",
      "fileName": "resume.pdf",
      "content": "..."
    },
    "jobDescription": {
      "title": "Senior Software Engineer",
      "company": "Tech Corp",
      "description": "..."
    }
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message",
  "details": {} // Optional additional details
}
```

### Common Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions/quota)
- `404`: Not Found
- `500`: Internal Server Error

---

## Rate Limiting

- **Free Plan**: 5 scans per month
- **Pro Plan**: Unlimited scans
- Rate limit headers included in responses:
  ```
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset: 1640000000
  ```

---

## Authentication Flow

1. **Register/Login** → Receive access + refresh tokens
2. **Store tokens** → localStorage (client-side)
3. **API Requests** → Include access token in Authorization header
4. **Token Expiry** → Use refresh token to get new access token
5. **Logout** → Revoke refresh token

---

## Best Practices

1. **Always use HTTPS** in production
2. **Store tokens securely** (httpOnly cookies in production)
3. **Handle token expiration** gracefully
4. **Implement retry logic** for failed requests
5. **Validate input** on client side before API calls
6. **Monitor rate limits** to avoid quota exceeded errors
