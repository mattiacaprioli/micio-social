import {Dimensions} from 'react-native';

const {width: deviceWidth, height: deviceHeight} = Dimensions.get('window');

export const hp = percentage => {
  return (percentage * deviceHeight) / 100;
}

export const wp = percentage => {
  return (percentage * deviceWidth) / 100;
}

export const stripHtmlTags = (html) => {
  return html.replace(/<[^>]*>?/gm, '');
}

export const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else if (diffInHours < 168) { 
    return date.toLocaleDateString('it-IT', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('it-IT', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  }
}