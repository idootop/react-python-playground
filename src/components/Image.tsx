import { forwardRef, useState } from 'react';

import { isEmpty } from '@/utils/is';
import { LNode } from '@/utils/types';

import { BoxProps, getBoxProps } from './Box';
import { Center } from './Flex';

interface ImageProps extends BoxProps {
  src?: string;
  onLoad?: LNode;
  onError?: LNode;
}

export const Image = forwardRef((props: ImageProps, ref: any) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  const boxProps = getBoxProps({
    ...props,
    extStyle: {
      ...props.extStyle,
      display: isLoaded && !isError ? 'block' : 'none',
      objectFit: 'cover',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
  });

  const {
    src,
    onLoad = (
      <Center
        {...boxProps}
        extStyle={{
          display: 'block',
        }}
      />
    ),
    onError = (
      <Center
        {...boxProps}
        extStyle={{
          display: 'block',
          color: '#666',
          textAlign: 'center',
          overflow: 'hidden',
          background: props.background ?? '#fff',
        }}
      >
        None
      </Center>
    ),
  } = props;

  return isEmpty(src) ? (
    (onError as any)
  ) : (
    <>
      <img
        ref={ref}
        src={src}
        {...boxProps}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsError(true)}
      />
      {!isLoaded && !isError ? onLoad : undefined}
      {isError ? onError : undefined}
    </>
  );
});
