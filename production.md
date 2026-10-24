Prepare my existing University College of Rathmalana Student Portal for production deployment.

**Current stack:** Node.js + Express  
**Current storage:** Local JSON files  
**Hosting target:** Render free web service  
**Persistent storage:** Supabase PostgreSQL and Supabase Storage  
**Source code:** GitHub

Before changing anything, inspect the existing project, package.json, server entry point, admin authentication, API routes, JSON data files, image upload logic, and .gitignore.

Requirements:

1. Preserve the existing UI, mobile responsiveness, navigation, and all working features.
2. Replace local JSON file writes and reads for students, batch representatives, modules, gallery metadata, and events with persistent Supabase database operations.
3. Migrate existing JSON records safely, without duplicates or data loss. Provide a repeatable migration script and explain how to run it.
4. Use database tables and relationships appropriate to the existing data model. Include SQL migrations and appropriate constraints.
5. Preserve admin login functionality, protect every admin API endpoint on the server, and enforce authorization. Do not rely on frontend-only route protection.
6. Store uploaded gallery images and profile pictures in Supabase Storage. Store their URLs or storage paths in the database.
7. Use environment variables for configuration. Keep Supabase secret/service-role credentials exclusively on the server. Never expose them in frontend code or commit them to GitHub.
8. If the existing admin authentication is insecure or incomplete, fix it and explain the required admin setup. Do not create a public admin-registration endpoint.
9. Add a `.env.example` containing placeholder values only.
10. Configure Express to use the hosting platform's assigned port, bind to `0.0.0.0` where necessary, and serve the existing frontend correctly.
11. Add useful error handling, input validation, upload restrictions, and database connection handling.
12. Add a health-check endpoint such as `/health`.
13. Verify that changes made in the admin dashboard persist after a server restart and redeployment.
14. Provide exact setup instructions for Supabase, GitHub, and Render, including build/start commands and all required environment variables.
15. Do not claim deployment readiness until the relevant checks have passed.

First report the existing architecture and the proposed changes. Then implement the changes without removing existing features. Preserve the original JSON data as a backup until migration is verified.