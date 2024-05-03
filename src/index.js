// 引入 Firebase SDK
$('#loginButton').click(() => {
    window.location.href = 'login.html';
  });

  import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

// 初始化 Firebase 应用配置
const firebaseConfig = {
    apiKey: "AIzaSyDKmfmOFNkOjyF7ug6ys8Ttmgg3LWY72w8",
	authDomain: "todo-38125.firebaseapp.com",
	projectId: "todo-38125",
	storageBucket: "todo-38125.appspot.com",
	messagingSenderId: "251533164758",
	appId: "1:251533164758:web:4424791c507de254cd8977"
};

// 初始化 Firebase 应用
const app = initializeApp(firebaseConfig);

// 获取 Firestore 实例
const db = getFirestore(app);

// 计算本周的开始和结束日期（字符串格式）
function getThisWeekDatesStringFormat() {
  const now = new Date();
  const firstDayOfWeek = now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1); // 计算本周第一天（周一）
  const lastDayOfWeek = firstDayOfWeek + 6; // 本周最后一天（周日）

  const firstDateOfWeek = new Date(now.setDate(firstDayOfWeek));
  firstDateOfWeek.setHours(0, 0, 0, 0); // 设置为当天开始时刻

  const lastDateOfWeek = new Date(now.setDate(lastDayOfWeek));
  lastDateOfWeek.setHours(23, 59, 59, 999); // 设置为当天结束时刻

  // 转换为字符串格式 YYYY-MM-DD
  const formatDateString = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return { start: formatDateString(firstDateOfWeek), end: formatDateString(lastDateOfWeek) };
}

// 使用字符串日期格式过滤本周课程的 Firestore 查询
function fetchThisWeekAppointments() {
  const { start, end } = getThisWeekDatesStringFormat();

  const appointmentsThisWeekQuery = query(collection(db, 'appointments'), 
    where('date', '>=', start),
    where('date', '<=', end)
  );

  getDocs(appointmentsThisWeekQuery).then(querySnapshot => {
    querySnapshot.forEach(doc => {
      const data = doc.data();
      // 创建课程列表项的 HTML 元素
      const courseItem = document.createElement('div');
      courseItem.classList.add('course-item');
      courseItem.innerHTML = `
        <p>名前:${data.name}</h3>
        <p>日期: ${data.date}</p>
        <p>時間: ${data.time}</p>
        <p>言語: ${data.language}</p>
        <p>人数: ${data.maxAttendees}</p>
      `;
      // 将课程列表项添加到页面中的课程列表容器中
      document.getElementById('weeklyClasses').appendChild(courseItem);
    });
  }).catch(error => {
    console.error('Error getting documents: ', error);
  });
}

// 调用函数以获取并显示本周的课程
fetchThisWeekAppointments();
