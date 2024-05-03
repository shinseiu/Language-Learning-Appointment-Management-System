/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!************************!*\
  !*** ./src/teacher.js ***!
  \************************/
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
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVhY2hlci5qcyIsIm1hcHBpbmdzIjoiOzs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0YsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbURBQW1EO0FBQ25EOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQyxVQUFVLDBDQUEwQyxjQUFjLGdCQUFnQixNQUFNO0FBQ3hILEtBQUs7QUFDTCxFQUFFO0FBQ0Y7QUFDQTs7QUFFQTs7O0FBR0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsRUFBRTtBQUNGOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQSwwQ0FBMEM7QUFDMUMsR0FBRztBQUNIO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsRUFBRTtBQUNGOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0EsRUFBRTtBQUNGOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0Isa0JBQWtCLElBQUkscUJBQXFCO0FBQ2pFLHNCQUFzQixpQkFBaUIsR0FBRyxpQkFBaUI7QUFDM0Q7O0FBRUE7QUFDQSxPQUFPOztBQUVQO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBLENBQUM7QUFDRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBLEVBQUU7QUFDRixDQUFDOztBQUVEO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdG9kby8uL3NyYy90ZWFjaGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuXHQkKCcuY2xvc2UnKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcblx0XHQvLyDlhbPpl63lr7nlupTnmoTmqKHmgIHmoYZcblx0XHQkKHRoaXMpLmNsb3Nlc3QoJy5tb2RhbCcpLmhpZGUoKTtcblx0fSk7XG59KTtcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuXHQvLyDnu5HlrprliKDpmaRhdHRlbmRlZeeahOeCueWHu+S6i+S7tlxuXHQkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmRlbGV0ZUF0dGVuZGVlJywgZnVuY3Rpb24oKSB7XG5cdCAgICBjb25zdCBhcHBvaW50bWVudElkID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuXHQgICAgY29uc3QgYXR0ZW5kZWVJbmRleCA9ICQodGhpcykuZGF0YSgnaW5kZXgnKTtcblx0ICAgIHJlbW92ZUF0dGVuZGVlKGFwcG9pbnRtZW50SWQsIGF0dGVuZGVlSW5kZXgpO1xuXHR9KTtcbn0pOyAgXG5cbi8vIOWIneWni+WMliBGaXJlYmFzZVxuY29uc3QgZmlyZWJhc2VDb25maWcgPSB7XG5cdGFwaUtleTogXCJBSXphU3lES21mbU9GTmtPanlGN3VnNnlzOFR0bWdnM0xXWTcydzhcIixcblx0YXV0aERvbWFpbjogXCJ0b2RvLTM4MTI1LmZpcmViYXNlYXBwLmNvbVwiLFxuXHRwcm9qZWN0SWQ6IFwidG9kby0zODEyNVwiLFxuXHRzdG9yYWdlQnVja2V0OiBcInRvZG8tMzgxMjUuYXBwc3BvdC5jb21cIixcblx0bWVzc2FnaW5nU2VuZGVySWQ6IFwiMjUxNTMzMTY0NzU4XCIsXG5cdGFwcElkOiBcIjE6MjUxNTMzMTY0NzU4OndlYjo0NDI0NzkxYzUwN2RlMjU0Y2Q4OTc3XCJcbn07XG5maXJlYmFzZS5pbml0aWFsaXplQXBwKGZpcmViYXNlQ29uZmlnKTtcblxuICAvLyDojrflj5YgQ2xvdWQgRmlyZXN0b3JlIOW8leeUqFxuY29uc3QgZGIgPSBmaXJlYmFzZS5maXJlc3RvcmUoKTtcblxuICAvLyDojrflj5YgRnVsbENhbGVuZGFyIOW8leeUqFxuY29uc3QgY2FsZW5kYXIgPSAkKCcjY2FsZW5kYXInKTtcblxuICAvLyDpgJrov4fpgInlrprnmoTml6XmnJ/mmL7npLrpooTnuqbkv6Hmga/mqKHmgIHmoYZcbmNvbnN0IGRpc3BsYXlBcHBvaW50bWVudE1vZGFsID0gKHN0YXJ0KSA9PiB7XG5cdCQoJyNkYXRlJykudmFsKG1vbWVudChzdGFydCkuZm9ybWF0KCdZWVlZLU1NLUREJykpO1xuXHQkKCcjdGltZScpLnZhbChtb21lbnQoc3RhcnQpLmZvcm1hdCgnSEg6bW0nKSk7XG5cdCQoJyNhcHBvaW50bWVudE1vZGFsJykuc2hvdygpO1xufTtcblxuICAvLyDkv67mlLkgRnVsbENhbGVuZGFyIOWIneWni+WMlua3u+WKoCBldmVudENsaWNrIOWbnuiwg1xuY2FsZW5kYXIuZnVsbENhbGVuZGFyKHtcblx0c2VsZWN0YWJsZTogdHJ1ZSxcblx0c2VsZWN0OiBmdW5jdGlvbihzdGFydCwgZW5kKSB7XG5cdGRpc3BsYXlBcHBvaW50bWVudE1vZGFsKHN0YXJ0KTtcblx0fSxcblx0ZXZlbnRDbGljazogZnVuY3Rpb24oZXZlbnQpIHtcblx0ICAgIC8vIOaYvuekuumihOe6puivpue7huS/oeaBr+eahOaooeaAgeahhlxuXHRzaG93QXBwb2ludG1lbnREZXRhaWxzKGV2ZW50LmlkKTtcblx0fVxuXHQvLyAuLi7lhbbkvZnphY3nva4uLi5cbn0pO1xuXG4gIC8vIOaYvuekuumihOe6puivpue7huS/oeaBr1xuY29uc3Qgc2hvd0FwcG9pbnRtZW50RGV0YWlscyA9IChhcHBvaW50bWVudElkKSA9PiB7XG4vL1x0Y29uc29sZS5sb2coXCLmn6XnnIvpooTnuqbor6bmg4XnmoQgSUQ6IFwiLCBhcHBvaW50bWVudElkKTtcblx0Y29uc3QgYXBwb2ludG1lbnRSZWYgPSBkYi5jb2xsZWN0aW9uKCdhcHBvaW50bWVudHMnKS5kb2MoYXBwb2ludG1lbnRJZCk7XG5cblx0YXBwb2ludG1lbnRSZWYuZ2V0KCkudGhlbigoZG9jKSA9PiB7XG5cdGlmIChkb2MuZXhpc3RzKSB7XG5cdFx0Y29uc3QgYXBwb2ludG1lbnREYXRhID0gZG9jLmRhdGEoKTtcblx0XHQkKCcjZGV0YWlsc05hbWUgc3BhbicpLnRleHQoYXBwb2ludG1lbnREYXRhLm5hbWUpO1xuXHRcdCQoJyNkZXRhaWxzRGF0ZSBzcGFuJykudGV4dChhcHBvaW50bWVudERhdGEuZGF0ZSk7XG5cdFx0JCgnI2RldGFpbHNUaW1lIHNwYW4nKS50ZXh0KGFwcG9pbnRtZW50RGF0YS50aW1lKTtcblx0XHQkKCcjZGV0YWlsc0xhbmd1YWdlIHNwYW4nKS50ZXh0KGFwcG9pbnRtZW50RGF0YS5sYW5ndWFnZSk7XG5cdFx0JCgnI2RldGFpbHNNZXNzYWdlIHNwYW4nKS50ZXh0KGFwcG9pbnRtZW50RGF0YS5tZXNzYWdlKTtcblx0XHQkKCcjZGV0YWlsc01heEF0dGVuZGVlcyBzcGFuJykudGV4dChhcHBvaW50bWVudERhdGEubWF4QXR0ZW5kZWVzKTtcblx0XHRsZXQgYXR0ZW5kZWVzID0gYXBwb2ludG1lbnREYXRhLmF0dGVuZGVlcyB8fCBbXTsgLy8g56Gu5L+dIGF0dGVuZGVlcyDmmK/kuIDkuKrmlbDnu4Rcblx0XHRsZXQgYXR0ZW5kZWVzSHRtbCA9ICc8cD7lj4LkuI7ogIU6PC9wPic7XG5cbi8vIOajgOafpSBhcHBvaW50bWVudERhdGEuYXR0ZW5kZWVzIOaYr+WQpuWtmOWcqOS4lOS4uuaVsOe7hFxuaWYgKEFycmF5LmlzQXJyYXkoYXBwb2ludG1lbnREYXRhLmF0dGVuZGVlcykpIHtcbiAgICBhcHBvaW50bWVudERhdGEuYXR0ZW5kZWVzLmZvckVhY2goKGF0dGVuZGVlLCBpbmRleCkgPT4ge1xuICAgICAgICBhdHRlbmRlZXNIdG1sICs9IGA8bGk+JHthdHRlbmRlZX0gPGJ1dHRvbiBjbGFzcz1cImRlbGV0ZUF0dGVuZGVlXCIgZGF0YS1pZD1cIiR7YXBwb2ludG1lbnRJZH1cIiBkYXRhLWluZGV4PVwiJHtpbmRleH1cIj7mtojjgZk8L2J1dHRvbj48L2xpPmA7XG4gICAgfSk7XG59IGVsc2Uge1xuICAgIC8vIOWPr+S7peWcqOi/memHjOWkhOeQhiBhcHBvaW50bWVudERhdGEuYXR0ZW5kZWVzIOS4jeWtmOWcqOaIluS4jeaYr+aVsOe7hOeahOaDheWGtVxufVxuXG4kKCcjZGV0YWlsc0F0dGVuZGVlcycpLmh0bWwoYXR0ZW5kZWVzSHRtbCk7XG5cblxuXHRcdCAgLy8g5pi+56S65qih5oCB5qGGXG5cdFx0JCgnI2FwcG9pbnRtZW50RGV0YWlscycpLnNob3coKTtcblx0fSBlbHNlIHtcblx0XHRjb25zb2xlLmxvZyhcIuayoeacieaJvuWIsOWvueW6lOeahOmihOe6puS/oeaBr++8gVwiKTtcblx0fVxuXHR9KS5jYXRjaCgoZXJyb3IpID0+IHtcblx0Y29uc29sZS5lcnJvcihcIuiOt+WPlumihOe6puivpuaDheaXtuWHuumUmTogXCIsIGVycm9yKTtcblx0fSk7XG59O1xuXG4gIC8vIOWIoOmZpGF0dGVuZGVl55qE5Ye95pWwXG5jb25zdCByZW1vdmVBdHRlbmRlZSA9IChhcHBvaW50bWVudElkLCBhdHRlbmRlZUluZGV4KSA9PiB7XG5cdGNvbnN0IGFwcG9pbnRtZW50UmVmID0gZGIuY29sbGVjdGlvbignYXBwb2ludG1lbnRzJykuZG9jKGFwcG9pbnRtZW50SWQpO1xuXG5cdC8vIOiOt+WPluW9k+WJjemihOe6pueahGF0dGVuZGVlc1xuYXBwb2ludG1lbnRSZWYuZ2V0KCkudGhlbigoZG9jKSA9PiB7XG5cdGlmIChkb2MuZXhpc3RzKSB7XG5cdFx0Y29uc3QgYXBwb2ludG1lbnREYXRhID0gZG9jLmRhdGEoKTtcblx0XHQgIC8vIOWIoOmZpOaMh+WumueahGF0dGVuZGVlXG5cdFx0YXBwb2ludG1lbnREYXRhLmF0dGVuZGVlcy5zcGxpY2UoYXR0ZW5kZWVJbmRleCwgMSk7XG5cdFx0ICAvLyDmm7TmlrDmlbDmja7lupNcblx0XHRhcHBvaW50bWVudFJlZi51cGRhdGUoe1xuXHRcdFx0YXR0ZW5kZWVzOiBhcHBvaW50bWVudERhdGEuYXR0ZW5kZWVzXG5cdFx0fSkudGhlbigoKSA9PiB7XG5cdFx0XHRjb25zb2xlLmxvZyhcIkF0dGVuZGVlIOW3suWIoOmZpFwiKTtcblx0XHRcdHNob3dBcHBvaW50bWVudERldGFpbHMoYXBwb2ludG1lbnRJZCk7IC8vIOWIt+aWsOivpue7huS/oeaBr+aooeaAgeahhlxuXHRcdH0pO1xuXHR9XG5cdH0pLmNhdGNoKChlcnJvcikgPT4ge1xuXHRjb25zb2xlLmVycm9yKFwi5Yig6ZmkYXR0ZW5kZWXml7blh7rplJk6IFwiLCBlcnJvcik7XG5cdH0pO1xufTtcblxuICAvLyDkv53lrZjpooTnuqbkv6Hmga/liLAgQ2xvdWQgRmlyZXN0b3JlIFxuY29uc3Qgc2F2ZUFwcG9pbnRtZW50ID0gKG5hbWUsIGRhdGUsIHRpbWUsIGxhbmd1YWdlLCBtZXNzYWdlLCBtYXhBdHRlbmRlZXMsIHVzZXIpID0+IHtcblx0Y29uc3QgYXBwb2ludG1lbnRzUmVmID0gZGIuY29sbGVjdGlvbignYXBwb2ludG1lbnRzJyk7XG5cbmFwcG9pbnRtZW50c1JlZlxuXHQuYWRkKHtcblx0XHRuYW1lOiBuYW1lLFxuXHRcdGRhdGU6IGRhdGUsXG5cdFx0dGltZTogdGltZSxcblx0XHRsYW5ndWFnZTogbGFuZ3VhZ2UsXG5cdFx0bWVzc2FnZTogbWVzc2FnZSxcblx0XHRtYXhBdHRlbmRlZXM6bWF4QXR0ZW5kZWVzLFxuXHRcdHVzZXJJZDogdXNlci51aWQsXG5cdH0pXG5cdC50aGVuKChkb2NSZWYpID0+IHtcblx0XHRjb25zb2xlLmxvZyhcIuW3sua3u+WKoOmihOe6piwgSUTkuLo6XCIsIGRvY1JlZi5pZCk7XG5cdH0pXG5cdC5jYXRjaCgoZXJyb3IpID0+IHtcblx0XHRjb25zb2xlLmVycm9yKFwi5re75Yqg6aKE57qm5pe25Y+R55Sf6ZSZ6K+v77yaXCIsIGVycm9yKTtcblx0fSk7XG59O1xuXG4gIC8vIOS7jiBDbG91ZCBGaXJlc3RvcmUg5Yqg6L295bm25Zyo5pel5Y6G5LiK5pi+56S66aKE57qm5L+h5oGvXG5jb25zdCBsb2FkQXBwb2ludG1lbnRzID0gKCkgPT4ge1xuXHRjb25zdCBhcHBvaW50bWVudHNSZWYgPSBkYi5jb2xsZWN0aW9uKCdhcHBvaW50bWVudHMnKTtcblxuYXBwb2ludG1lbnRzUmVmXG5cdC5nZXQoKVxuXHQudGhlbigocXVlcnlTbmFwc2hvdCkgPT4ge1xuXHRjb25zdCBldmVudHMgPSBbXTtcbiAgICAgIHF1ZXJ5U25hcHNob3QuZm9yRWFjaCgoZG9jKSA9PiB7XG5cdFx0Y29uc29sZS5sb2coXCJEb2N1bWVudCBJRDogXCIsIGRvYy5pZCk7XG4gICAgICAgICAgICBjb25zdCBhcHBvaW50bWVudCA9IGRvYy5kYXRhKCk7XG4gICAgICAgICAgICBjb25zdCBldmVudCA9IHtcbiAgICAgICAgICAgIGlkOiBkb2MuaWQsXG4gICAgICAgICAgICB0aXRsZTogYCR7YXBwb2ludG1lbnQubmFtZX0gLSAke2FwcG9pbnRtZW50Lmxhbmd1YWdlfWAsXG4gICAgICAgICAgICBzdGFydDogYCR7YXBwb2ludG1lbnQuZGF0ZX1UJHthcHBvaW50bWVudC50aW1lfWAsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBldmVudHMucHVzaChldmVudCk7XG4gICAgICB9KTtcblxuICAgICAgICAvLyDlnKjml6XljobkuIrmuLLmn5Pkuovku7ZcbiAgICAgIGNhbGVuZGFyLmZ1bGxDYWxlbmRhcigncmVuZGVyRXZlbnRzJywgZXZlbnRzLCB0cnVlKTtcbn0pXG4uY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICBjb25zb2xlLmVycm9yKFwi5Yqg6L296aKE57qm5L+h5oGv5pe25Y+R55Sf6ZSZ6K+v77yaXCIsIGVycm9yKTtcbn0pO1xufTtcblxuLy8g55uR5ZCs55So5oi355m75b2V54q2XG5maXJlYmFzZS5hdXRoKCkub25BdXRoU3RhdGVDaGFuZ2VkKCh1c2VyKSA9PiB7XG5pZiAodXNlcikge1xuY29uc29sZS5sb2coXCLnlKjmiLflt7LnmbvlvZUsIFVJROS4ujpcIiArIHVzZXIudWlkKTtcbiAgICAvLyDliJ3lp4vljJYgRnVsbENhbGVuZGFyXG5jYWxlbmRhci5mdWxsQ2FsZW5kYXIoe1xuXHRoZWFkZXI6IHtcblx0bGVmdDogJ3ByZXYsbmV4dCB0b2RheScsXG5cdGNlbnRlcjogJ3RpdGxlJyxcblx0cmlnaHQ6ICdtb250aCxhZ2VuZGFXZWVrLGFnZW5kYURheScsXG5cdH0sXG5cdHNlbGVjdGFibGU6IHRydWUsXG5cdHNlbGVjdDogKHN0YXJ0LCBlbmQpID0+IHtcblx0ICAgIC8vIOeCueWHu+aXpeacn+aXtuaYvuekuumihOe6puaooeaAgeahhlxuXHRkaXNwbGF5QXBwb2ludG1lbnRNb2RhbChzdGFydCk7XG5cdH0sXG5cdGV2ZW50Q2xpY2s6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdCAgICAvLyDmmL7npLrpooTnuqbor6bnu4bkv6Hmga/nmoTmqKHmgIHmoYZcblx0Y29uc29sZS5sb2coXCJDbGlja2VkIGV2ZW50IElEOiBcIiwgZXZlbnQuaWQpOyBcblx0c2hvd0FwcG9pbnRtZW50RGV0YWlscyhldmVudC5pZCk7XG5cdH1cblx0Ly8gLi4u5YW25LuWIEZ1bGxDYWxlbmRhciDphY3nva4uLi5cbn0pO1xuXG4gIC8vIOaPkOS6pOmihOe6puihqOWNlVxuJCgnI2FwcG9pbnRtZW50Rm9ybScpLnN1Ym1pdCgoZXZlbnQpID0+IHtcblx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRjb25zdCBuYW1lID0gJCgnI25hbWUnKS52YWwoKTtcblx0Y29uc3QgZGF0ZSA9ICQoJyNkYXRlJykudmFsKCk7XG5cdGNvbnN0IHRpbWUgPSAkKCcjdGltZScpLnZhbCgpO1xuXHRjb25zdCBsYW5ndWFnZSA9ICQoJyNsYW5ndWFnZScpLnZhbCgpO1xuXHRjb25zdCBtZXNzYWdlID0gJCgnI21lc3NhZ2UnKS52YWwoKTtcblx0Y29uc3QgbWF4QXR0ZW5kZWVzID0gJCgnI21heEF0dGVuZGVlcycpLnZhbCgpO1xuXG5cdC8vIOS/neWtmOmihOe6puS/oeaBr+WIsCBDbG91ZCBGaXJlc3RvcmVcblx0c2F2ZUFwcG9pbnRtZW50KG5hbWUsIGRhdGUsIHRpbWUsIGxhbmd1YWdlLCBtZXNzYWdlLCBtYXhBdHRlbmRlZXMsIGZpcmViYXNlLmF1dGgoKS5jdXJyZW50VXNlcik7XG5cdCQoJyNhcHBvaW50bWVudE1vZGFsJykuaGlkZSgpO1xufSk7XG5cbiAgLy8g5aSE55CG6YCA5Ye65oyJ6ZKu54K55Ye7XG4kKCcjZXhpdEJ1dHRvbicpLmNsaWNrKCgpID0+IHtcblx0ZmlyZWJhc2UuYXV0aCgpLnNpZ25PdXQoKS50aGVuKCgpID0+IHtcblx0d2luZG93LmxvY2F0aW9uLmhyZWYgPSAnaW5kZXguaHRtbCc7XG5cdH0pLmNhdGNoKChlcnJvcikgPT4ge1xuXHRjb25zb2xlLmVycm9yKFwi6YCA5Ye65pe25Y+R55Sf6ZSZ6K+v77yaXCIsIGVycm9yKTtcblx0fSk7XG59KTtcblxuICAvLyDliqDovb3lubbmmL7npLrpooTnuqbkv6Hmga9cbmxvYWRBcHBvaW50bWVudHMoKTtcbn0gZWxzZSB7XG5jb25zb2xlLmxvZyhcIueUqOaIt+acqueZu+W9lVwiKTtcbiAgLy8g5Y+v5Lul6YeN5a6a5ZCR5Yiw55m75b2V6aG16Z2iXG59XG59KTsiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=