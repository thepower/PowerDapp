import React, { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { initApplicationThunk } from 'application/thunks/initApplication';
import { FullScreenLoader } from 'common';

// import { LogInPage } from 'login/components/pages/LogInPage';
import { checkIfLoading } from 'network/selectors';

import AddOrEditNFTPage from 'NFTs/components/pages/addNFT/AddOrEditNFTPage';
import AuthorNFTsPage from 'NFTs/components/pages/authorNFTs/AuthorNFTsPage';
import NFTPage from 'NFTs/components/pages/NFT/NFTPage';
import NFTsPage from 'NFTs/components/pages/NFTs/NFTsPage';
import DAONFTsPage from 'NFTs/components/pages/orgNFTs/DAONFTsPage';
import EditProfilePage from 'profiles/components/pages/editProfilePage/EditProfilePage';
import ProfilesPage from 'profiles/components/pages/profilesPage/ProfilesPage';
import { getIsModerator } from 'profiles/selectors/rolesSelectors';
import SSOPage from 'sso/pages/SSOPage';
import AboutPage from './pages/about/AboutPage';
import { useAppDispatch, useAppSelector } from '../hooks';
import { RoutesEnum } from '../typings/routes';

const AppRoutesComponent: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isModerator = useAppSelector(getIsModerator);

  const networkApi = useAppSelector(
    (state) => state.applicationData.networkApi
  );
  const loading = useAppSelector((state) =>
    checkIfLoading(state, initApplicationThunk.typePrefix)
  );

  useEffect(() => {
    if (!networkApi && !loading) dispatch(initApplicationThunk(navigate));
  }, []);

  if (!networkApi || loading) {
    return <FullScreenLoader />;
  }

  return (
    <Routes>
      <Route path={RoutesEnum.root}>
        <Route index element={<NFTsPage />} />

        {/* View about page */}
        <Route path={RoutesEnum.about} Component={AboutPage} />

        {/*  // Login or register via SSO */}
        <Route path={`${RoutesEnum.sso}/:data`} Component={SSOPage} />
        {/* <Route path={RoutesEnum.login} Component={LogInPage} /> */}

        {/* Edit profile by wallet address or current user (without address) */}
        <Route
          path={`${RoutesEnum.editProfile}/:walletAddress?`}
          Component={EditProfilePage}
        />

        {/* Add or edit NFT by wallet address and id */}
        <Route path={`${RoutesEnum.add}`} Component={AddOrEditNFTPage} />

        {isModerator && (
          <Route
            path={RoutesEnum.draft}
            Component={() => <NFTsPage isDraft />}
          />
        )}

        {isModerator && (
          <Route path={RoutesEnum.authors} Component={ProfilesPage} />
        )}

        {/* View DAO NFT page by DAO slug */}
        <Route path={`${RoutesEnum.dao}/:daoSlug`} Component={DAONFTsPage} />

        <Route path='*' Component={NFTsPage} />

        <Route path=':walletAddress'>
          {/* View author NFT page by wallet address and id and slug */}
          <Route index element={<AuthorNFTsPage />} />
          {/* View NFT page */}
          <Route path=':draft?/:idAndSlug' Component={NFTPage} />
          {/* Edit NFT by wallet address and id and slug */}
          <Route
            path={`:idAndSlug${RoutesEnum.edit}`}
            Component={AddOrEditNFTPage}
          />
        </Route>
      </Route>
    </Routes>
  );
};

export const AppRoutes = AppRoutesComponent;
