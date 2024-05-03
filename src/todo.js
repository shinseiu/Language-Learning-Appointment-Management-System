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
