# Job Application Tracker

A full-stack web app for tracking job applications through each stage of a job search: Applied, Interview, Offer, and Rejected.

Built to practise and show real-world .NET skills: a layered REST API, Entity Framework Core migrations, validation, and a React front end.



**Live demo:** _coming soon_

## Features

- Add, view, edit, and delete job applications
- Move an application between stages (Applied, Interview, Offer, Rejected)
- Search by company or job title and filter by stage
- Input validation with clear error messages
- Data stored in SQL Server with EF Core migrations

## Tech stack

| Layer | Technology |
|---|---|
| Back end | ASP.NET Core Web API (C#), Entity Framework Core |
| Database | SQL Server (LocalDB for development) |
| Front end | React with Vite |
| API testing | Scalar / `.http` file |

## Project structure

```
JobTracker/
├── JobTracker.Api/          ASP.NET Core Web API
│   ├── Controllers/         HTTP endpoints
│   ├── Services/            Business logic (injected with DI)
│   ├── Dtos/                Request and response models with validation
│   ├── Models/              Database entities and enums
│   ├── Data/                AppDbContext and migrations
│   └── JobTracker.Api.http  Sample requests
└── jobtracker-web/          React front end
    └── src/
        ├── api.js           All API calls
        ├── App.jsx          Main page
        └── ApplicationForm.jsx
```

The controller only handles HTTP concerns and calls a service. The service holds the logic and talks to the database through `AppDbContext`. DTOs keep the API shape separate from the database entities.

## Getting started

### Requirements

- .NET SDK (the version in `JobTracker.Api.csproj`)
- Node.js 18 or newer
- SQL Server LocalDB (included with Visual Studio) or any SQL Server instance

### 1. Run the API

```
cd JobTracker.Api
dotnet tool restore
dotnet ef database update
dotnet run
```

The API starts on the address shown in the console, for example `https://localhost:7123`. Update the connection string in `appsettings.json` if you are not using LocalDB.

### 2. Run the front end

Open `jobtracker-web/vite.config.js` and set the proxy `target` to your API address. Then:

```
cd jobtracker-web
npm install
npm run dev
```

Open http://localhost:5173.

## API endpoints

| Method | URL | Description | Success |
|---|---|---|---|
| GET | `/api/applications` | List all applications | 200 |
| GET | `/api/applications/{id}` | Get one application | 200 / 404 |
| POST | `/api/applications` | Create an application | 201 |
| PUT | `/api/applications/{id}` | Update an application | 200 / 404 |
| PATCH | `/api/applications/{id}/stage` | Change the stage | 200 / 404 |
| DELETE | `/api/applications/{id}` | Delete an application | 204 / 404 |

Example request body for `POST /api/applications`:

```json
{
  "company": "Acme",
  "title": ".NET Developer",
  "link": "https://acme.com/jobs/1",
  "appliedDate": "2026-10-02T00:00:00Z"
}
```

Invalid input returns `400 Bad Request` with the list of problems. You can try every endpoint with the requests in `JobTracker.Api/JobTracker.Api.http`.

## Roadmap

- [x] Application CRUD and stage updates
- [x] React interface with search and filter
- [x] Server-side pagination, search, and sorting
- [ ] Global exception handling with `ProblemDetails`
- [x] User registration and login with JWT
- [x] Notes, interviews, and stage history
- [x] Dashboard with stats and charts
- [ ] Unit tests with xUnit
- [ ] Docker setup and GitHub Actions CI
- [ ] Deployment to Azure

## What I learned

_Add two or three sentences here about what you learned or what was hardest. Recruiters read this section._

## Author

**Daya Ks**
https://www.linkedin.com/in/dayasathyan/
