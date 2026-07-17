# Church Management System

A modern, fast, and secure web application designed to help church administrators effortlessly manage their congregation and financial records. Built with React, Tailwind CSS, and Firebase.

## 🚀 Key Features

*   **Member Directory**: Seamlessly add, view, update, deactivate, or delete church members with real-time syncing.
*   **Financial Records (Offerings)**: Log and track tithes, offerings, and special funds. Includes an intuitive dashboard for monthly analytics.
*   **Role-Based Access Control**: Strict `Admin` vs `Staff` access levels. The "Default Admin Email" is securely configured to prevent unauthorized administrative actions.
*   **Custom Notifications**: Beautiful, animated modals and confirmation dialogs for a premium user experience (no more ugly browser alerts).
*   **Dark Mode**: Native, beautiful dark/light mode toggle for accessibility and aesthetics.
*   **Exportable Reports**: Generate and download comprehensive CSV reports for both members and financial records.

## 🛠️ Tech Stack

*   **Frontend**: React (Vite)
*   **Styling**: Tailwind CSS, Lucide React (Icons)
*   **Backend / Database**: Firebase (Firestore)
*   **Authentication**: Firebase Auth (Google Sign-in)

## 📦 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/church-management-system.git
    cd church-management-system
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Setup Firebase:**
    Ensure your `src/lib/firebase.js` is configured with your active Firebase project credentials.
4.  **Run the development server:**
    ```bash
    npm run dev
    ```

## 🔒 Security Note (Admin Setup)
If you are deploying this for the first time on a fresh database, the **first user** to log in will automatically become the Default Administrator. Future admins can be assigned in the Settings panel.
