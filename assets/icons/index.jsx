import { Text, View } from 'react-native'
import React from 'react'
import { 
  HomeIcon,
  MailIcon,
  LockIcon,
  UserIcon,
  HeartIcon,
  PlusIcon,
  SearchIcon,
  LocationIcon,
  CallIcon,
  CameraIcon,
  EditIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ThreeDotsCircleIcon,
  ThreeDotsHorizontalIcon,
  CommentIcon,
  ShareIcon,
  SendIcon,
  DeleteIcon,
  LogoutIcon,
  ImageIcon,
  VideoIcon,
} from './featherIcons'
import { theme } from '../../constants/theme'

const icons = {
  home: HomeIcon,
  mail: MailIcon,
  lock: LockIcon,
  user: UserIcon,
  heart: HeartIcon,
  plus: PlusIcon,
  search: SearchIcon,
  location: LocationIcon,
  call: CallIcon,
  camera: CameraIcon,
  edit: EditIcon,
  arrowLeft: ArrowLeftIcon,
  arrowRight: ArrowRightIcon,
  threeDotsCircle: ThreeDotsCircleIcon,
  threeDotsHorizontal: ThreeDotsHorizontalIcon,
  comment: CommentIcon,
  share: ShareIcon,
  send: SendIcon,
  delete: DeleteIcon,
  logout: LogoutIcon,
  image: ImageIcon,
  video: VideoIcon,
}

const Icon = ({name, ...props}) => {
  const IconComponent = icons[name];
  return (
    <IconComponent 
      size={props.size || 24}
      color={theme.colors.textLight}
      {...props}
    />
  )
}

export default Icon