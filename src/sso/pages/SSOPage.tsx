import React, { useEffect, useMemo } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { setWalletData } from 'account/slice/accountSlice';
import { RoutesEnum } from 'application/typings/routes';
import { setKeyToApplicationStorage } from 'application/utils/localStorageUtils';
import { stringToObject } from 'sso/utils';

const mapDispatchToProps = {
  setWalletData
};

const connector = connect(null, mapDispatchToProps);

type SSOProps = ConnectedProps<typeof connector>;

const SSOPageComponent: React.FC<SSOProps> = ({ setWalletData }) => {
  const navigate = useNavigate();
  const { data } = useParams<{ data: string }>();

  const parsedData: {
    address?: string;
    returnUrl: string;
  } = useMemo(() => (data ? stringToObject(data) : null), [data]);

  useEffect(() => {
    if (parsedData?.address) {
      setKeyToApplicationStorage('address', parsedData?.address);
      setWalletData({ address: parsedData?.address, logged: true });

      if (parsedData.returnUrl) {
        window.location.replace(parsedData.returnUrl);
      } else {
        navigate(RoutesEnum.root);
      }
    }
  }, []);

  return null;
};

export default connector(SSOPageComponent);
