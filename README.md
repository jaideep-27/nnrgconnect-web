# NNRG Connect Web 🚀

## Connecting Minds, Fostering Growth

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

NNRG Connect Web is a dynamic and intuitive platform designed to bridge the gap between students, fostering seamless connections and collaborations within the NNRG community. From personalized profiles to powerful search capabilities, this application empowers students to discover, connect, and grow together.

---

## ✨ Features

*   **Secure User Authentication**: Robust login and signup system with JWT for secure access.
*   **Personalized Profiles**: Students can create and manage their unique profiles, including academic details, contact information, LinkedIn profiles, and profile pictures.
*   **Profile Picture & ID Card Uploads**: Seamlessly upload profile pictures and college ID cards (for admin approval).
*   **Student Search & Discovery**: A powerful search engine to find other students based on various criteria (name, roll number, branch, academic year).
*   **Connection Management**: Connect with peers and build a network within the college community.
*   **Admin Approval System**: Admins can review and approve student registrations based on their uploaded college ID cards, ensuring a verified community.
*   **Responsive Design**: A user-friendly interface that looks great on any device.
*   **Error & Loading States**: Enhanced user experience with clear loading indicators and error messages.

---

## 🛠️ Technologies Used

**Frontend**:
*   **React.js**: A declarative, efficient, and flexible JavaScript library for building user interfaces.
*   **React Router**: For declarative routing in React applications.
*   **Axios**: Promise-based HTTP client for the browser and node.js.
*   **CSS**: Modern and responsive styling.

**Backend**:
*   **Node.js**: JavaScript runtime built on Chrome's V8 JavaScript engine.
*   **Express.js**: Fast, unopinionated, minimalist web framework for Node.js.
*   **MongoDB**: A NoSQL document database for scalable data storage.
*   **Mongoose**: MongoDB object data modeling (ODM) for Node.js.
*   **bcryptjs**: For hashing passwords securely.
*   **jsonwebtoken (JWT)**: For secure authentication.
*   **Multer**: A node.js middleware for handling `multipart/form-data`, primarily used for uploading files.

---

## 🚀 Getting Started

Follow these steps to get your development environment up and running.

### Prerequisites

*   Node.js (LTS version recommended)
*   npm (comes with Node.js) or Yarn
*   MongoDB instance (local or cloud-based like MongoDB Atlas)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/nnrgconnect-web.git
    cd nnrgconnect-web
    ```

2.  **Backend Setup:**

    Navigate to the `server` directory and install dependencies:

    ```bash
    cd server
    npm install # or yarn install
    ```

    Create a `.env` file in the `server` directory and add your environment variables:

    ```env
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    PORT=5001 # Or any other port
    FRONTEND_URL=http://localhost:3000 # Your frontend URL for CORS and image URL construction
    ```

3.  **Frontend Setup:**

    Navigate to the `client` directory and install dependencies:

    ```bash
    cd ../client
    npm install # or yarn install
    ```

    Create a `.env` file in the `client` directory and add your environment variables:

    ```env
    REACT_APP_API_URL=http://localhost:5001/api # Ensure this matches your backend URL
    ```

### Running the Application

1.  **Start the Backend Server:**

    From the `server` directory:

    ```bash
    npm start # or node server.js
    ```

    The server will run on `http://localhost:5001` (or your specified PORT).

2.  **Start the Frontend Development Server:**

    From the `client` directory:

    ```bash
    npm start
    ```

    The React app will open in your browser at `http://localhost:3000` (or another available port).

---

## 📁 Project Structure

```
nnrgconnect-web/
├── client/              # Frontend (React.js)
│   ├── public/          # Public assets
│   ├── src/             # React source code
│   │   ├── components/  # Reusable UI components
│   │   ├── contexts/    # React Context API for global state
│   │   ├── pages/       # Different pages of the application (e.g., Student, Admin)
│   │   ├── services/    # API integration services
│   │   └── App.js       # Main application component
│   ├── .env             # Frontend environment variables
│   └── package.json     # Frontend dependencies
├── server/              # Backend (Node.js, Express.js)
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic for routes
│   ├── middleware/      # Express middleware (e.g., auth)
│   ├── models/          # Mongoose schemas for MongoDB
│   ├── routes/          # API routes
│   ├── uploads/         # Directory for uploaded files (profile pics, ID cards)
│   ├── .env             # Backend environment variables
│   └── server.js        # Main server entry point
├── .gitignore           # Specifies intentionally untracked files to ignore
├── README.md            # This file!
└── package.json         # Root project dependencies (if any)
```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📞 Contact

Your Name - your.email@example.com

Project Link: [https://github.com/your-username/nnrgconnect-web](https://github.com/your-username/nnrgconnect-web) (Replace with your actual GitHub repo link) 