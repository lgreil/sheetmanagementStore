# Bachkreis Sheet Management API

This repository contains the API/Backend for the Bachkreis Sheet Management project. It provides a robust and flexible RESTful API for managing musical sheets (Stücke), composers, arrangers, and related data. The API is built using NestJS, Prisma, and PostgreSQL, and includes support for importing data from TSV files.

## Overview

The Bachkreis Sheet Management API is designed to help manage musical sheet records, along with the people (composers and arrangers) associated with them. It offers features such as:

- CRUD operations for musical pieces (Stücke) and persons.
- Many-to-many relationships between pieces and persons to link composers and arrangers.
- Data import capabilities to bulk load TSV data.
- Validation using class-validator for reliable and consistent data.
- API documentation automatically generated via Swagger.

## Technology Stack

- **Backend Framework:** NestJS
- **ORM:** Prisma
- **Database:** PostgreSQL
- **API Documentation:** Swagger (accessible at /api)
- **Data Validation:** class-validator

## Getting Started

### Prerequisites

- **Node.js:** v14.x or higher
- **PostgreSQL:** Ensure you have a running instance
- **npm or yarn**

### Installation

1. **Clone the Repository:**

    ```bash
    git clone https://github.com/yourusername/bachkreis-sheet-management-api.git
    cd bachkreis-sheet-management-api
    ```

2. **Install Dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3. **Configure Environment Variables:**

    Create a `.env` file at the root of the project and set your environment variables. For example:

    ```env
    DATABASE_URL=postgresql://user:password@localhost:5432/bachkreis
    PORT=3000
    ```

4. **Generate Prisma Client and Run Migrations:**

    ```bash
    npx prisma generate
    npx prisma migrate dev --name init
    ```

5. **Start the Application:**

    ```bash
    npm run start:dev
    # or
    yarn start:dev
    ```

6. **Access API Documentation:**

    Once the server is running, navigate to [http://localhost:3000/api](http://localhost:3000/api) to view the Swagger API documentation.

## Importing Data

A Python script is provided to import TSV data into the API. The script performs the following:

- Reads data from `input.tsv`.
- Creates or retrieves person records for composers and arrangers.
- Creates or updates Stücke records and correctly links them to the respective persons.
- Outputs the API responses to `output.json` for debugging and verification.

Ensure you have Python installed along with the `requests` package:

```bash
pip install requests
```

Review the script in `scripts/import_data.py` and adjust the API endpoint URLs if necessary.

## Contributing

Contributions are welcome! Please read our `CONTRIBUTING.md` for details on our code of conduct and guidelines for submitting pull requests.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## Contact

Comming soon
