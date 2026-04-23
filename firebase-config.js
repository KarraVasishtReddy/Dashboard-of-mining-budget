import { initializeApp } from "https://www.gstatic.com/firebasejs/9.x.x/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.x.x/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.x.x/firebase-firestore.js";

const firebaseConfig = {
  // Copy this from your Firebase Project Settings
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// Check user status and role
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data();

    if (userData.role === 'admin') {
      showAdminFeatures();
    } else {
      showUserView();
    }
  } else {
    // Redirect to login or show public view
    window.location.href = "login.html";
  }
});

function showAdminFeatures() {
  // Show all edit buttons and admin panels
  document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
  console.log("Admin Access Granted");
}

function showUserView() {
  // Hide edit buttons
  document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
  console.log("User Access: Read Only");
}
<div id="budget-item-1">
  <span>Equipment Maintenance: $50,000</span>
  <button class="admin-only" onclick="editBudget('equipment', 60000)" style="display:none;">
    Update Budget
  </button>
</div>
async function editBudget(category, newValue) {
  const user = auth.currentUser;
  
  // Extra security check: Verify role again before writing
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (userDoc.data().role !== 'admin') {
    alert("Unauthorized: Only admins can edit data.");
    return;
  }

  try {
    const budgetRef = doc(db, "mining_data", "budget_2024");
    await updateDoc(budgetRef, {
      [category]: newValue
    });
    alert("Budget updated successfully!");
    location.reload(); // Refresh dashboard to show new charts
  } catch (error) {
    console.error("Error updating budget: ", error);
  }
}
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone logged in to read the budget
    match /mining_data/{document} {
      allow read: if request.auth != null;
      // Only allow write if the user has the 'admin' role in the 'users' collection
      allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users can only read their own profile
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
    }
  }
}
