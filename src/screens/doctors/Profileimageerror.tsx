import React, { useState } from 'react';
import { Image, ImageStyle } from 'react-native';

interface ProfileImageProps {
  uri: string | null;
  style: ImageStyle;
}

const ProfileImage: React.FC<ProfileImageProps> = ({ uri, style }) => {
  const [error, setError] = useState(false);

  if (!uri || error) {
    return <Image source={require('../assets/default_profile.png')} style={style} />;
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      onError={() => setError(true)}
    />
  );
};

export default ProfileImage;
