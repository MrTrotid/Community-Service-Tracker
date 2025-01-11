# Community Service Tracker

The **Community Service Tracker** is an online platform designed to streamline the process of logging, tracking, and managing community service hours for students. With an intuitive interface, it helps students and administrators efficiently monitor initial service hours, log completed hours, and handle any additional hours assigned as disciplinary actions.

---

## 📋 Overview

The platform is built to:  
- **Log Initial Hours**: Every student starts with a default of **50 community service hours**.  
- **Track Hours in Real Time**: Students can log hours they've completed and view the updated totals.  
- **Manage Punishment Hours**: Administrators or teachers can assign additional service hours for disciplinary reasons, and the system updates the totals seamlessly.  
- **Show Service Opportunities**: The platform provides a curated list of approved places where students can perform community service.  
- **Ensure Verification and Approval**: Hours submitted by students are reviewed and approved by administrators/teachers to ensure authenticity.  

---

## 🚀 Key Features

- **Initial Hours Allocation**:  
  - Each student begins with 50 mandatory community service hours.  

- **Real-Time Hour Tracking**:  
  - Students log their completed hours and instantly view their remaining hours.  

- **Punishment Hour Management**:  
  - Additional hours for disciplinary actions are added to a student’s service balance.  

- **Service Opportunities Database**:  
  - Displays approved locations for fulfilling service obligations.  

- **Verification & Approval**:  
  - Submitted hours are reviewed by admins/teachers for authenticity and approval.  

- **User Dashboard**:  
  - Personalized dashboards for students to monitor their progress and for administrators to manage service logs.  

---

## 🎯 Tech Stack  

### **Frontend**  
- HTML, CSS, JavaScript  
- Bootstrap (for responsive design)  

### **Backend**  
- Node.js (with Express.js)  

### **Database**  
- Firebase Firestore (free tier)  

### **Authentication**  
- Firebase Authentication  

### **Hosting**  
- Firebase Hosting or Vercel  

### **Tools**  
- **GitHub** for version control  
- **Figma** for UI/UX design  

---

## 🛠 Team Responsibilities  

| **Name**                 | **Responsibilities**                                  |  
|--------------------------|-------------------------------------------------------|  
| **Samip Aryal**          | Responsive UI development for both frontend & backend |  
| **Parchetash Dhakal**    | UI design in Figma and implementation                 |  
| **Samragyi Lamichhane**  | Responsive UI for frontend & backend                 |  
| **Baman Prasad Guragain**| Firebase integration and backend/frontend development |  

---

## 📂 Folder Structure  

```
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/        # Firebase service integration
│   ├── styles/          # CSS and Bootstrap files
│   ├── App.js
├── package.json
├── README.md
├── .gitignore
```

---

## 🌐 Setup & Installation  

1. **Clone the Repository**  
   ```bash  
   git clone https://github.com/username/community-service-tracker.git  
   ```  

2. **Navigate to the Project Directory**  
   ```bash  
   cd community-service-tracker  
   ```  

3. **Install Dependencies**  
   ```bash  
   npm install  
   ```  

4. **Start the Development Server**  
   ```bash  
   npm start  
   ```  

5. **Access the App**  
   - Navigate to `http://localhost:3000` in your browser.  

---

## 🛡 Authentication  

- The system uses Firebase Authentication for secure sign-in and sign-up.  
- Roles and permissions ensure that only admins can manage logs while students can log their own hours.

---

## 📚 Contribution  

We welcome contributions! Please follow these steps:  
1. **Fork the repository**  
2. **Create a feature branch**  
   ```bash  
   git checkout -b feature-branch-name  
   ```  
3. **Make your changes and commit them**  
   ```bash  
   git commit -m "Describe your changes"  
   ```  
4. **Push the changes**  
   ```bash  
   git push origin feature-branch-name  
   ```  
5. **Create a Pull Request**  

---

## 📄 License  

This project is licensed under the **MIT License**.  

---

Let’s make tracking community service hours easier and more efficient! 😊  
