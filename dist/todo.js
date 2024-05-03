/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!*********************!*\
  !*** ./src/todo.js ***!
  \*********************/
// 初始化 Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDKmfmOFNkOjyF7ug6ys8Ttmgg3LWY72w8",
  authDomain: "todo-38125.firebaseapp.com",
  projectId: "todo-38125",
  storageBucket: "todo-38125.appspot.com",
  messagingSenderId: "251533164758",
  appId: "1:251533164758:web:4424791c507de254cd8977"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const calendar = $('#calendar');
let currentAppointmentId = null;

// 通过选定的日期显示预约信息模态框
const displayAppointmentModal = (start) => {
  $('#date').val(moment(start).format('YYYY-MM-DD'));
  $('#time').val(moment(start).format('HH:mm'));
  $('#appointmentModal').show();
};

// 展示预约详情的模态框
const displayDetailsModal = (appointmentId) => {
  currentAppointmentId = appointmentId;
  db.collection('appointments').doc(appointmentId).get().then((doc) => {
    if (doc.exists) {
      const data = doc.data();
      $('#appointmentDetails').html(`
        先生の名前: ${data.name}<br>
        日付け: ${data.date}<br>
        時間: ${data.time}<br>
        言語: ${data.language}<br>
        参加者人数: ${data.maxAttendees}<br>
        シラバス: ${data.message || 'No message'}`
      );
      $('#detailsModal').show();
    } else {
      console.log("No such document!");
    }
  }).catch((error) => {
    console.error("Error getting document:", error);
  });
};

// 处理预约按钮点击
$('#bookButton').click(() => {
  const userName = $('#userName').val();
  if (userName) {
    bookAppointment(currentAppointmentId, userName);
    $('#detailsModal').hide();
  } else {
    alert("请输入您的名字");
  }
});

const bookAppointment = (appointmentId, userName) => {
  const appointmentRef = db.collection('appointments').doc(appointmentId);

  appointmentRef.update({
    attendees: firebase.firestore.FieldValue.arrayUnion(userName)
  }).then(() => {
    console.log("预约成功");
    loadAppointments(); // 重新加载预约信息以更新界面
  }).catch((error) => {
    console.error("预约时发生错误：", error);
  });
};

// 从 Cloud Firestore 加载并在日历上显示预约信息
const loadAppointments = () => {
  calendar.fullCalendar('removeEvents');
  const appointmentsRef = db.collection('appointments');
  appointmentsRef.get().then((querySnapshot) => {
    const events = [];

    querySnapshot.forEach((doc) => {
      const appointment = doc.data();
      const isFull = appointment.attendees && appointment.attendees.length >= appointment.maxAttendees;

      const event = {
        title: `${appointment.name} - ${appointment.language}`,
        start: moment(`${appointment.date}T${appointment.time}`).format(),
        id: doc.id,
        color: isFull ? 'black' : '',
        rendering: isFull ? 'background' : ''
      };
      events.push(event);
    });

    calendar.fullCalendar('renderEvents', events, true);
  }).catch((error) => {
    console.error("加载预约信息时发生错误：", error);
  });
};

// 初始化 FullCalendar
calendar.fullCalendar({
  header: {
    left: 'prev,next today',
    center: 'title',
    right: 'month,agendaWeek,agendaDay',
  },
  selectable: true,
  select: (start, end) => {
    displayAppointmentModal(start);
  },
  eventClick: function(event) {
    if (event.id && event.color !== 'black') { // 只有当预约未满时才显示详情
      displayDetailsModal(event.id);
    }
  },
  // ...其他 FullCalendar 配置...
});

// 点击“X”关闭模态框
$('.close').on('click', () => {
  $('#appointmentModal').hide();
  $('#detailsModal').hide();
});

// 提交预约表单
$('#appointmentForm').submit((event) => {
  event.preventDefault();

  const name = $('#name').val();
  const date = $('#date').val();
  const time = $('#time').val();
  const language = $('#language').val();
  const message = $('#message').val(); // 获取 message 字段的值
  const user = firebase.auth().currentUser;

  if (user) {
    saveAppointment(name, date, time, language, message, user);
    $('#appointmentModal').hide();
  }
});

// 处理退出按钮点击
$('#exitButton').click(() => {
  firebase.auth().signOut().then(() => {
    window.location.href = 'index.html';
  });
});

// 加载并显示预约信息
loadAppointments();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9kby5qcyIsIm1hcHBpbmdzIjoiOzs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsVUFBVTtBQUMzQixlQUFlLFVBQVU7QUFDekIsY0FBYyxVQUFVO0FBQ3hCLGNBQWMsY0FBYztBQUM1QixpQkFBaUIsa0JBQWtCO0FBQ25DLGdCQUFnQiw2QkFBNkI7QUFDN0M7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQSx3QkFBd0I7QUFDeEIsR0FBRztBQUNIO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxrQkFBa0Isa0JBQWtCLElBQUkscUJBQXFCO0FBQzdELHlCQUF5QixpQkFBaUIsR0FBRyxpQkFBaUI7QUFDOUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQSxHQUFHO0FBQ0g7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLCtDQUErQztBQUMvQztBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUNBQXVDO0FBQ3ZDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSCxDQUFDOztBQUVEO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90b2RvLy4vc3JjL3RvZG8uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8g5Yid5aeL5YyWIEZpcmViYXNlXG5jb25zdCBmaXJlYmFzZUNvbmZpZyA9IHtcbiAgYXBpS2V5OiBcIkFJemFTeURLbWZtT0ZOa09qeUY3dWc2eXM4VHRtZ2czTFdZNzJ3OFwiLFxuICBhdXRoRG9tYWluOiBcInRvZG8tMzgxMjUuZmlyZWJhc2VhcHAuY29tXCIsXG4gIHByb2plY3RJZDogXCJ0b2RvLTM4MTI1XCIsXG4gIHN0b3JhZ2VCdWNrZXQ6IFwidG9kby0zODEyNS5hcHBzcG90LmNvbVwiLFxuICBtZXNzYWdpbmdTZW5kZXJJZDogXCIyNTE1MzMxNjQ3NThcIixcbiAgYXBwSWQ6IFwiMToyNTE1MzMxNjQ3NTg6d2ViOjQ0MjQ3OTFjNTA3ZGUyNTRjZDg5NzdcIlxufTtcblxuZmlyZWJhc2UuaW5pdGlhbGl6ZUFwcChmaXJlYmFzZUNvbmZpZyk7XG5jb25zdCBkYiA9IGZpcmViYXNlLmZpcmVzdG9yZSgpO1xuY29uc3QgY2FsZW5kYXIgPSAkKCcjY2FsZW5kYXInKTtcbmxldCBjdXJyZW50QXBwb2ludG1lbnRJZCA9IG51bGw7XG5cbi8vIOmAmui/h+mAieWumueahOaXpeacn+aYvuekuumihOe6puS/oeaBr+aooeaAgeahhlxuY29uc3QgZGlzcGxheUFwcG9pbnRtZW50TW9kYWwgPSAoc3RhcnQpID0+IHtcbiAgJCgnI2RhdGUnKS52YWwobW9tZW50KHN0YXJ0KS5mb3JtYXQoJ1lZWVktTU0tREQnKSk7XG4gICQoJyN0aW1lJykudmFsKG1vbWVudChzdGFydCkuZm9ybWF0KCdISDptbScpKTtcbiAgJCgnI2FwcG9pbnRtZW50TW9kYWwnKS5zaG93KCk7XG59O1xuXG4vLyDlsZXnpLrpooTnuqbor6bmg4XnmoTmqKHmgIHmoYZcbmNvbnN0IGRpc3BsYXlEZXRhaWxzTW9kYWwgPSAoYXBwb2ludG1lbnRJZCkgPT4ge1xuICBjdXJyZW50QXBwb2ludG1lbnRJZCA9IGFwcG9pbnRtZW50SWQ7XG4gIGRiLmNvbGxlY3Rpb24oJ2FwcG9pbnRtZW50cycpLmRvYyhhcHBvaW50bWVudElkKS5nZXQoKS50aGVuKChkb2MpID0+IHtcbiAgICBpZiAoZG9jLmV4aXN0cykge1xuICAgICAgY29uc3QgZGF0YSA9IGRvYy5kYXRhKCk7XG4gICAgICAkKCcjYXBwb2ludG1lbnREZXRhaWxzJykuaHRtbChgXG4gICAgICAgIOWFiOeUn+OBruWQjeWJjTogJHtkYXRhLm5hbWV9PGJyPlxuICAgICAgICDml6Xku5jjgZE6ICR7ZGF0YS5kYXRlfTxicj5cbiAgICAgICAg5pmC6ZaTOiAke2RhdGEudGltZX08YnI+XG4gICAgICAgIOiogOiqnjogJHtkYXRhLmxhbmd1YWdlfTxicj5cbiAgICAgICAg5Y+C5Yqg6ICF5Lq65pWwOiAke2RhdGEubWF4QXR0ZW5kZWVzfTxicj5cbiAgICAgICAg44K344Op44OQ44K5OiAke2RhdGEubWVzc2FnZSB8fCAnTm8gbWVzc2FnZSd9YFxuICAgICAgKTtcbiAgICAgICQoJyNkZXRhaWxzTW9kYWwnKS5zaG93KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiTm8gc3VjaCBkb2N1bWVudCFcIik7XG4gICAgfVxuICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgZ2V0dGluZyBkb2N1bWVudDpcIiwgZXJyb3IpO1xuICB9KTtcbn07XG5cbi8vIOWkhOeQhumihOe6puaMiemSrueCueWHu1xuJCgnI2Jvb2tCdXR0b24nKS5jbGljaygoKSA9PiB7XG4gIGNvbnN0IHVzZXJOYW1lID0gJCgnI3VzZXJOYW1lJykudmFsKCk7XG4gIGlmICh1c2VyTmFtZSkge1xuICAgIGJvb2tBcHBvaW50bWVudChjdXJyZW50QXBwb2ludG1lbnRJZCwgdXNlck5hbWUpO1xuICAgICQoJyNkZXRhaWxzTW9kYWwnKS5oaWRlKCk7XG4gIH0gZWxzZSB7XG4gICAgYWxlcnQoXCLor7fovpPlhaXmgqjnmoTlkI3lrZdcIik7XG4gIH1cbn0pO1xuXG5jb25zdCBib29rQXBwb2ludG1lbnQgPSAoYXBwb2ludG1lbnRJZCwgdXNlck5hbWUpID0+IHtcbiAgY29uc3QgYXBwb2ludG1lbnRSZWYgPSBkYi5jb2xsZWN0aW9uKCdhcHBvaW50bWVudHMnKS5kb2MoYXBwb2ludG1lbnRJZCk7XG5cbiAgYXBwb2ludG1lbnRSZWYudXBkYXRlKHtcbiAgICBhdHRlbmRlZXM6IGZpcmViYXNlLmZpcmVzdG9yZS5GaWVsZFZhbHVlLmFycmF5VW5pb24odXNlck5hbWUpXG4gIH0pLnRoZW4oKCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKFwi6aKE57qm5oiQ5YqfXCIpO1xuICAgIGxvYWRBcHBvaW50bWVudHMoKTsgLy8g6YeN5paw5Yqg6L296aKE57qm5L+h5oGv5Lul5pu05paw55WM6Z2iXG4gIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgIGNvbnNvbGUuZXJyb3IoXCLpooTnuqbml7blj5HnlJ/plJnor6/vvJpcIiwgZXJyb3IpO1xuICB9KTtcbn07XG5cbi8vIOS7jiBDbG91ZCBGaXJlc3RvcmUg5Yqg6L295bm25Zyo5pel5Y6G5LiK5pi+56S66aKE57qm5L+h5oGvXG5jb25zdCBsb2FkQXBwb2ludG1lbnRzID0gKCkgPT4ge1xuICBjYWxlbmRhci5mdWxsQ2FsZW5kYXIoJ3JlbW92ZUV2ZW50cycpO1xuICBjb25zdCBhcHBvaW50bWVudHNSZWYgPSBkYi5jb2xsZWN0aW9uKCdhcHBvaW50bWVudHMnKTtcbiAgYXBwb2ludG1lbnRzUmVmLmdldCgpLnRoZW4oKHF1ZXJ5U25hcHNob3QpID0+IHtcbiAgICBjb25zdCBldmVudHMgPSBbXTtcblxuICAgIHF1ZXJ5U25hcHNob3QuZm9yRWFjaCgoZG9jKSA9PiB7XG4gICAgICBjb25zdCBhcHBvaW50bWVudCA9IGRvYy5kYXRhKCk7XG4gICAgICBjb25zdCBpc0Z1bGwgPSBhcHBvaW50bWVudC5hdHRlbmRlZXMgJiYgYXBwb2ludG1lbnQuYXR0ZW5kZWVzLmxlbmd0aCA+PSBhcHBvaW50bWVudC5tYXhBdHRlbmRlZXM7XG5cbiAgICAgIGNvbnN0IGV2ZW50ID0ge1xuICAgICAgICB0aXRsZTogYCR7YXBwb2ludG1lbnQubmFtZX0gLSAke2FwcG9pbnRtZW50Lmxhbmd1YWdlfWAsXG4gICAgICAgIHN0YXJ0OiBtb21lbnQoYCR7YXBwb2ludG1lbnQuZGF0ZX1UJHthcHBvaW50bWVudC50aW1lfWApLmZvcm1hdCgpLFxuICAgICAgICBpZDogZG9jLmlkLFxuICAgICAgICBjb2xvcjogaXNGdWxsID8gJ2JsYWNrJyA6ICcnLFxuICAgICAgICByZW5kZXJpbmc6IGlzRnVsbCA/ICdiYWNrZ3JvdW5kJyA6ICcnXG4gICAgICB9O1xuICAgICAgZXZlbnRzLnB1c2goZXZlbnQpO1xuICAgIH0pO1xuXG4gICAgY2FsZW5kYXIuZnVsbENhbGVuZGFyKCdyZW5kZXJFdmVudHMnLCBldmVudHMsIHRydWUpO1xuICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICBjb25zb2xlLmVycm9yKFwi5Yqg6L296aKE57qm5L+h5oGv5pe25Y+R55Sf6ZSZ6K+v77yaXCIsIGVycm9yKTtcbiAgfSk7XG59O1xuXG4vLyDliJ3lp4vljJYgRnVsbENhbGVuZGFyXG5jYWxlbmRhci5mdWxsQ2FsZW5kYXIoe1xuICBoZWFkZXI6IHtcbiAgICBsZWZ0OiAncHJldixuZXh0IHRvZGF5JyxcbiAgICBjZW50ZXI6ICd0aXRsZScsXG4gICAgcmlnaHQ6ICdtb250aCxhZ2VuZGFXZWVrLGFnZW5kYURheScsXG4gIH0sXG4gIHNlbGVjdGFibGU6IHRydWUsXG4gIHNlbGVjdDogKHN0YXJ0LCBlbmQpID0+IHtcbiAgICBkaXNwbGF5QXBwb2ludG1lbnRNb2RhbChzdGFydCk7XG4gIH0sXG4gIGV2ZW50Q2xpY2s6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LmlkICYmIGV2ZW50LmNvbG9yICE9PSAnYmxhY2snKSB7IC8vIOWPquacieW9k+mihOe6puacqua7oeaXtuaJjeaYvuekuuivpuaDhVxuICAgICAgZGlzcGxheURldGFpbHNNb2RhbChldmVudC5pZCk7XG4gICAgfVxuICB9LFxuICAvLyAuLi7lhbbku5YgRnVsbENhbGVuZGFyIOmFjee9ri4uLlxufSk7XG5cbi8vIOeCueWHu+KAnFjigJ3lhbPpl63mqKHmgIHmoYZcbiQoJy5jbG9zZScpLm9uKCdjbGljaycsICgpID0+IHtcbiAgJCgnI2FwcG9pbnRtZW50TW9kYWwnKS5oaWRlKCk7XG4gICQoJyNkZXRhaWxzTW9kYWwnKS5oaWRlKCk7XG59KTtcblxuLy8g5o+Q5Lqk6aKE57qm6KGo5Y2VXG4kKCcjYXBwb2ludG1lbnRGb3JtJykuc3VibWl0KChldmVudCkgPT4ge1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gIGNvbnN0IG5hbWUgPSAkKCcjbmFtZScpLnZhbCgpO1xuICBjb25zdCBkYXRlID0gJCgnI2RhdGUnKS52YWwoKTtcbiAgY29uc3QgdGltZSA9ICQoJyN0aW1lJykudmFsKCk7XG4gIGNvbnN0IGxhbmd1YWdlID0gJCgnI2xhbmd1YWdlJykudmFsKCk7XG4gIGNvbnN0IG1lc3NhZ2UgPSAkKCcjbWVzc2FnZScpLnZhbCgpOyAvLyDojrflj5YgbWVzc2FnZSDlrZfmrrXnmoTlgLxcbiAgY29uc3QgdXNlciA9IGZpcmViYXNlLmF1dGgoKS5jdXJyZW50VXNlcjtcblxuICBpZiAodXNlcikge1xuICAgIHNhdmVBcHBvaW50bWVudChuYW1lLCBkYXRlLCB0aW1lLCBsYW5ndWFnZSwgbWVzc2FnZSwgdXNlcik7XG4gICAgJCgnI2FwcG9pbnRtZW50TW9kYWwnKS5oaWRlKCk7XG4gIH1cbn0pO1xuXG4vLyDlpITnkIbpgIDlh7rmjInpkq7ngrnlh7tcbiQoJyNleGl0QnV0dG9uJykuY2xpY2soKCkgPT4ge1xuICBmaXJlYmFzZS5hdXRoKCkuc2lnbk91dCgpLnRoZW4oKCkgPT4ge1xuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJ2luZGV4Lmh0bWwnO1xuICB9KTtcbn0pO1xuXG4vLyDliqDovb3lubbmmL7npLrpooTnuqbkv6Hmga9cbmxvYWRBcHBvaW50bWVudHMoKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==