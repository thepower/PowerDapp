import React, { useEffect, useMemo, useState } from 'react';
import { ConnectedProps, connect } from 'react-redux';

import {
  Layout,
  OutlinedInput,
  Button,
  IconButton,
} from 'common';
import Dropzone from 'react-dropzone';
import { RootState } from 'application/store';
import { CloseButtonIcon, ImagePlusIcon } from 'assets/icons';
import {
  useFormik,
} from 'formik';
import * as yup from 'yup';

import { push } from 'connected-react-router';
import { isMobile } from 'application/components/App';
import { useTranslation } from 'react-i18next';
import { RoutesEnum } from 'application/typings/routes';
import { createOrEditProfileTrigger } from 'profiles/slice/profilesSlice';
import { checkIfLoading } from 'network/selectors';
import { getWalletAddress } from 'account/selectors/accountSelectors';
import { getProfile } from 'profiles/selectors/profilesSelectors';
import { Clear as ClearIcon } from '@mui/icons-material';
import { downloadFile } from 'api/openResty';
import appEnvs from 'appEnvs';
import { RouteComponentProps } from 'react-router';
import { toast } from 'react-toastify';
import styles from './EditProfilePage.module.scss';
import { loadProfileTrigger } from '../../../slice/profilesSlice';

type OwnProps = RouteComponentProps<{ walletAddress?: string }>;

type InitialValues = {
  firstName: string;
  lastName: string;
  email: string;
};

const mapDispatchToProps = {
  routeTo: push,
  createOrEditProfileTrigger,
  loadProfileTrigger,
};

const mapStateToProps = (state: RootState, props: OwnProps) => ({
  isLoading: checkIfLoading(state, loadProfileTrigger.type),
  editedWalletAddress: props?.match?.params?.walletAddress,
  isSubmitLoading: checkIfLoading(state, createOrEditProfileTrigger.type),
  walletAddress: getWalletAddress(state),
  profile: getProfile(state),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type EditProfilePageComponentProps = ConnectedProps<typeof connector>;

const EditProfilePageComponent: React.FC<EditProfilePageComponentProps> = ({
  profile,
  routeTo,
  createOrEditProfileTrigger,
  loadProfileTrigger,
  isSubmitLoading,
  isLoading,
  walletAddress,
  editedWalletAddress,
}) => {
  const initialValues: InitialValues = {
    firstName: '',
    lastName: '',
    email: '',
  };

  const { t } = useTranslation();

  const [images, setImages] = useState<File[]>([]);

  useEffect(() => {
    if (editedWalletAddress || walletAddress) loadProfileTrigger(editedWalletAddress || walletAddress);
  }, [walletAddress, editedWalletAddress]);

  const validationSchema = useMemo(
    () => yup.object({
      firstName: yup
        .string()
        .required(t('requiredField'))
        .max(50, ({ max }) => t('noMoreCharacters', { max })),
      lastName: yup
        .string()
        .required(t('requiredField'))
        .max(50, ({ max }) => t('noMoreCharacters', { max })),
      email: yup
        .string()
        .max(50, ({ max }) => t('noMoreCharacters', { max })),
    }),
    [t],
  );

  const handleSubmit = async (values: InitialValues) => {
    if (!images.length) return toast.error(t('addImageRequestError'));
    return createOrEditProfileTrigger({
      ...values,
      photo: images[0],
      editedWalletAddress,
    });
  };

  const formik = useFormik({
    initialValues,
    onSubmit: handleSubmit,
    validationSchema,
  });

  useEffect(() => {
    if (profile) formik.setValues(profile);
  }, [JSON.stringify(profile)]);

  useEffect(() => {
    if (profile?.photoHash) {
      downloadFile(profile.photoHash, appEnvs.OPEN_RESTY_PROFILE_BUCKET).then(
        (file) => {
          if (file) setImages([file]);
        },
      );
    }
  }, [profile?.photoHash]);

  const onDropImages = (images: any) => {
    setImages(images);
  };

  const onClickClear = () => {
    setImages([]);
  };

  const attachImage = useMemo(() => {
    if (images.length) {
      return (
        <>
          <IconButton
            onClick={onClickClear}
            className={styles.imagePreviewClear}
          >
            <ClearIcon />
          </IconButton>
          <img
            className={styles.imagePreview}
            src={URL.createObjectURL(images[0])}
            alt=""
          />
        </>
      );
    }
    return (
      <Dropzone
        maxFiles={1}
        maxSize={31457280}
        onDrop={onDropImages}
        accept={{ 'image/*': ['.jpeg', '.png'] }}
      >
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps({ className: styles.imageDropZone })}>
            <ImagePlusIcon className={styles.imageDropZoneIcon} />
            {t('uploadImage')}
            <input {...getInputProps()} />
          </div>
        )}
      </Dropzone>
    );
  }, [images, t]);

  const size = isMobile ? 'small' : 'medium';

  return (
    <Layout>
      <div className={styles.content}>
        <form className={styles.form} onSubmit={formik.handleSubmit}>
          <div className={styles.formFields}>
            <div className={styles.leftColumn}>{attachImage}</div>
            <div className={styles.rightColumn}>
              <div className={styles.themeRow}>
                <OutlinedInput
                  {...formik.getFieldProps('firstName')}
                  id="firstName"
                  label={t('firstName')}
                  placeholder={t('enterFirstName')}
                  size="small"
                  errorMessage={formik.errors.firstName}
                  error={
                    formik.touched.firstName && Boolean(formik.errors.firstName)
                  }
                  className={styles.limitedWidth}
                  disabled={formik.isSubmitting || isLoading}
                />
                <IconButton
                  className={styles.closeButton}
                  onClick={() => routeTo(RoutesEnum.root)}
                >
                  <CloseButtonIcon />
                </IconButton>
              </div>
              <OutlinedInput
                id="lastName"
                label={t('lastName')}
                placeholder={t('enterLastName')}
                size="small"
                errorMessage={formik.errors.lastName}
                error={
                  formik.touched.lastName && Boolean(formik.errors.lastName)
                }
                className={styles.limitedWidth}
                disabled={formik.isSubmitting || isLoading}
                {...formik.getFieldProps('lastName')}
              />
              <OutlinedInput
                id="email"
                label={t('email')}
                placeholder={t('enterEmail')}
                size="small"
                errorMessage={formik.errors.email}
                error={
                  formik.touched.email && Boolean(formik.errors.email)
                }
                className={styles.limitedWidth}
                disabled={formik.isSubmitting || isLoading}
                {...formik.getFieldProps('email')}
              />
              <div className={styles.divider} />
            </div>
          </div>
          <Button
            size={size}
            type="submit"
            variant="contained"
            loading={isSubmitLoading}
            className={styles.submitButton}
            disabled={!formik.isValid || !formik.dirty}
          >
            {t('saveProfile')}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export const EditProfilePage = connector(EditProfilePageComponent);
