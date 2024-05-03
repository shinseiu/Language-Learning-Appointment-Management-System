import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyDKmfmOFNkOjyF7ug6ys8Ttmgg3LWY72w8",
  authDomain: "todo-38125.firebaseapp.com",
  projectId: "todo-38125",
  storageBucket: "todo-38125.appspot.com",
  messagingSenderId: "251533164758",
  appId: "1:251533164758:web:4424791c507de254cd8977"
};

document.addEventListener('DOMContentLoaded', function() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);


  const formSignIn = document.getElementById("form-sign-in");
  if (formSignIn) {
      formSignIn.onsubmit = async (event) => {
          event.preventDefault();
          const formData = new FormData(event.target);
          const email = formData.get("email");
          const password = formData.get("password");

          try {
              const userCredential = await signInWithEmailAndPassword(auth, email, password);
              const user = userCredential.user;

              // 检查用户角色
              const userDocRef = doc(db, "users", user.uid);
              const userDoc = await getDoc(userDocRef);
              if (userDoc.exists() && userDoc.data().role === 'admin') {
                  // 用户是管理员，重定向到管理员页面
                  window.location.href = 'teacher.html';
              } else {
                  // 用户是普通用户，重定向到普通用户页面
                  window.location.href = 'todo.html';
              }
          } catch (error) {
              console.error("登录失败", error);
              // 这里可以处理登录失败的逻辑
          }
      };
  }

  const formSignOut = document.getElementById("form-sign-out");
  if (formSignOut) {
      formSignOut.onsubmit = (event) => {
          event.preventDefault();
          auth.signOut();
      };
  }

  onAuthStateChanged(auth, (user) => {
      if (user) {
          console.log("サインイン");
          formSignIn && formSignIn.classList.add("hidden");
          formSignOut && formSignOut.classList.remove("hidden");
          const input = document.getElementById("sign-out-email");
          if (input) input.value = user.email;
      } else {
          console.log("サインアウト");
          formSignIn && formSignIn.classList.remove("hidden");
          formSignOut && formSignOut.classList.add("hidden");
      }
  });
});
