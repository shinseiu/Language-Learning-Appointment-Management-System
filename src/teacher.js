$(document).ready(function() {
	$('.close').on('click', function() {
		// 关闭对应的模态框
		$(this).closest('.modal').hide();
	});
});
$(document).ready(function() {
	// 绑定删除attendee的点击事件
	$(document).on('click', '.deleteAttendee', function() {
	    const appointmentId = $(this).data('id');
	    const attendeeIndex = $(this).data('index');
	    removeAttendee(appointmentId, attendeeIndex);
	});
});  

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

  // 获取 Cloud Firestore 引用
const db = firebase.firestore();

  // 获取 FullCalendar 引用
const calendar = $('#calendar');

  // 通过选定的日期显示预约信息模态框
const displayAppointmentModal = (start) => {
	$('#date').val(moment(start).format('YYYY-MM-DD'));
	$('#time').val(moment(start).format('HH:mm'));
	$('#appointmentModal').show();
};

  // 修改 FullCalendar 初始化添加 eventClick 回调
calendar.fullCalendar({
	selectable: true,
	select: function(start, end) {
	displayAppointmentModal(start);
	},
	eventClick: function(event) {
	    // 显示预约详细信息的模态框
	showAppointmentDetails(event.id);
	}
	// ...其余配置...
});

  // 显示预约详细信息
const showAppointmentDetails = (appointmentId) => {
//	console.log("查看预约详情的 ID: ", appointmentId);
	const appointmentRef = db.collection('appointments').doc(appointmentId);

	appointmentRef.get().then((doc) => {
	if (doc.exists) {
		const appointmentData = doc.data();
		$('#detailsName span').text(appointmentData.name);
		$('#detailsDate span').text(appointmentData.date);
		$('#detailsTime span').text(appointmentData.time);
		$('#detailsLanguage span').text(appointmentData.language);
		$('#detailsMessage span').text(appointmentData.message);
		$('#detailsMaxAttendees span').text(appointmentData.maxAttendees);
		let attendees = appointmentData.attendees || []; // 确保 attendees 是一个数组
		let attendeesHtml = '<p>参与者:</p>';

// 检查 appointmentData.attendees 是否存在且为数组
if (Array.isArray(appointmentData.attendees)) {
    appointmentData.attendees.forEach((attendee, index) => {
        attendeesHtml += `<li>${attendee} <button class="deleteAttendee" data-id="${appointmentId}" data-index="${index}">消す</button></li>`;
    });
} else {
    // 可以在这里处理 appointmentData.attendees 不存在或不是数组的情况
}

$('#detailsAttendees').html(attendeesHtml);


		  // 显示模态框
		$('#appointmentDetails').show();
	} else {
		console.log("没有找到对应的预约信息！");
	}
	}).catch((error) => {
	console.error("获取预约详情时出错: ", error);
	});
};

  // 删除attendee的函数
const removeAttendee = (appointmentId, attendeeIndex) => {
	const appointmentRef = db.collection('appointments').doc(appointmentId);

	// 获取当前预约的attendees
appointmentRef.get().then((doc) => {
	if (doc.exists) {
		const appointmentData = doc.data();
		  // 删除指定的attendee
		appointmentData.attendees.splice(attendeeIndex, 1);
		  // 更新数据库
		appointmentRef.update({
			attendees: appointmentData.attendees
		}).then(() => {
			console.log("Attendee 已删除");
			showAppointmentDetails(appointmentId); // 刷新详细信息模态框
		});
	}
	}).catch((error) => {
	console.error("删除attendee时出错: ", error);
	});
};

  // 保存预约信息到 Cloud Firestore 
const saveAppointment = (name, date, time, language, message, maxAttendees, user) => {
	const appointmentsRef = db.collection('appointments');

appointmentsRef
	.add({
		name: name,
		date: date,
		time: time,
		language: language,
		message: message,
		maxAttendees:maxAttendees,
		userId: user.uid,
	})
	.then((docRef) => {
		console.log("已添加预约, ID为:", docRef.id);
	})
	.catch((error) => {
		console.error("添加预约时发生错误：", error);
	});
};

  // 从 Cloud Firestore 加载并在日历上显示预约信息
const loadAppointments = () => {
	const appointmentsRef = db.collection('appointments');

appointmentsRef
	.get()
	.then((querySnapshot) => {
	const events = [];
      querySnapshot.forEach((doc) => {
		console.log("Document ID: ", doc.id);
            const appointment = doc.data();
            const event = {
            id: doc.id,
            title: `${appointment.name} - ${appointment.language}`,
            start: `${appointment.date}T${appointment.time}`,
            };

            events.push(event);
      });

        // 在日历上渲染事件
      calendar.fullCalendar('renderEvents', events, true);
})
.catch((error) => {
      console.error("加载预约信息时发生错误：", error);
});
};

// 监听用户登录状
firebase.auth().onAuthStateChanged((user) => {
if (user) {
console.log("用户已登录, UID为:" + user.uid);
    // 初始化 FullCalendar
calendar.fullCalendar({
	header: {
	left: 'prev,next today',
	center: 'title',
	right: 'month,agendaWeek,agendaDay',
	},
	selectable: true,
	select: (start, end) => {
	    // 点击日期时显示预约模态框
	displayAppointmentModal(start);
	},
	eventClick: function(event) {
	    // 显示预约详细信息的模态框
	console.log("Clicked event ID: ", event.id); 
	showAppointmentDetails(event.id);
	}
	// ...其他 FullCalendar 配置...
});

  // 提交预约表单
$('#appointmentForm').submit((event) => {
	event.preventDefault();

	const name = $('#name').val();
	const date = $('#date').val();
	const time = $('#time').val();
	const language = $('#language').val();
	const message = $('#message').val();
	const maxAttendees = $('#maxAttendees').val();

	// 保存预约信息到 Cloud Firestore
	saveAppointment(name, date, time, language, message, maxAttendees, firebase.auth().currentUser);
	$('#appointmentModal').hide();
});

  // 处理退出按钮点击
$('#exitButton').click(() => {
	firebase.auth().signOut().then(() => {
	window.location.href = 'index.html';
	}).catch((error) => {
	console.error("退出时发生错误：", error);
	});
});

  // 加载并显示预约信息
loadAppointments();
} else {
console.log("用户未登录");
  // 可以重定向到登录页面
}
});