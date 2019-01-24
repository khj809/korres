import PushNotification from 'react-native-push-notification';

PushNotification.configure({
    onNotification: (noti) => {
        console.log('Notification: ', noti);
    }
});

const sendLocalNotification = (title, message) => {
    PushNotification.localNotification({title, message});
}

export {
    sendLocalNotification,
}