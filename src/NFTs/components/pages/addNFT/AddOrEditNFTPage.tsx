import React, { useEffect, useState } from 'react';

import { Clear as ClearIcon } from '@mui/icons-material';
import { getIn, useFormik } from 'formik';
import { pick } from 'lodash';
import Dropzone from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { ConnectedProps, connect } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { getWalletAddress } from 'account/selectors/accountSelectors';
import { downloadFile } from 'api/openResty';
import { isMobile } from 'application/components/App';
import { daosForSelect } from 'application/constants';
import { RootState } from 'application/store';
import { RoutesEnum } from 'application/typings/routes';
import { CloseButtonIcon, ImagePlusIcon } from 'assets/icons';
import {
  Layout,
  OutlinedInput,
  Button,
  IconButton,
  FullScreenLoader,
  Select
} from 'common';
import { checkIfLoading } from 'network/selectors';
import { nftCategoriesForSelect, nftLanguagesForSelect } from 'NFTs/constants';
import { getNFT } from 'NFTs/selectors/NFTsSelectors';
import { mintNft, saveNFTData, loadNFT, editNFT } from 'NFTs/thunks/NFTs';
import styles from './AddOrEditNFTPage.module.scss';

const initialValues = {
  language: '',
  theme: '',
  nameOfDAOSlug: '',
  category: '',
  description: ''
};

type InitialValues = typeof initialValues;

const mapDispatchToProps = {
  mintNft,
  saveNFTData,
  loadNFT,
  editNFT
};

const mapStateToProps = (state: RootState) => {
  return {
    walletAddress: getWalletAddress(state),
    isMintNftNFTLoading: checkIfLoading(state, mintNft.typePrefix),
    isSaveNFTDataLoading: checkIfLoading(state, saveNFTData.typePrefix),
    isEditNFTLoading: checkIfLoading(state, editNFT.typePrefix),
    isNFTLoading: checkIfLoading(state, loadNFT.typePrefix),
    NFT: getNFT(state)
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type AddOrEditNFTComponentProps = ConnectedProps<typeof connector>;

const AddOrEditNFTComponent: React.FC<AddOrEditNFTComponentProps> = ({
  mintNft,
  saveNFTData,
  isMintNftNFTLoading,
  isSaveNFTDataLoading,
  isEditNFTLoading,
  isNFTLoading,
  NFT,
  loadNFT,
  editNFT
}) => {
  const { t } = useTranslation();
  const [mintedNftNFTId, setMintedNftNFTId] = useState<number | null>(null);

  const navigate = useNavigate();

  const [images, setImages] = useState<File[]>([]);

  const { idAndSlug } = useParams<{ idAndSlug?: string }>();

  const id = idAndSlug?.match(/^\d+/)?.[0];

  useEffect(() => {
    if (id) {
      loadNFT({ id, isDraft: true });
    }
  }, []);

  const getValidationSchema = () =>
    yup.object({
      language: yup.string().required(t('requiredField')),
      theme: yup
        .string()
        .required(t('requiredField'))
        .max(140, ({ max }) => t('noMoreCharacters', { max })),
      category: yup.string().required(t('requiredField')),

      description: yup
        .string()
        .max(560, ({ max }) => t('noMoreCharacters', { max }))
    });

  const handleSubmit = async ({ ...values }: InitialValues) => {
    if (!images.length) return toast.error(t('addImageRequestError'));

    if (id) {
      return editNFT({
        id: +id,
        ...values,
        image: images[0],
        walletAddress: NFT?.walletAddress
      });
    }
    if (!mintedNftNFTId) {
      return mintNft({
        ...values,
        additionalActionOnSuccess: (NFTId) => {
          setMintedNftNFTId(NFTId as number);
        }
      });
    }

    return saveNFTData({
      id: mintedNftNFTId,
      image: images[0],
      theme: values.theme
    });
  };

  const formik = useFormik({
    initialValues,
    onSubmit: handleSubmit,
    validationSchema: getValidationSchema()
  });

  useEffect(() => {
    if (NFT && id) {
      if (NFT?.imageHash && id) {
        downloadFile(NFT.imageHash, id).then((file) => {
          if (file) setImages([file]);
        });
      }

      formik.setValues(
        pick(
          NFT,
          'language',
          'theme',
          'nameOfDAOSlug',
          'category',
          'description'
        )
      );
    }
  }, [NFT]);

  const onDropImages = (images: any) => {
    setImages(images);
  };

  const onClickClear = () => {
    setImages([]);
  };

  const renderAttachImage = () => {
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
            alt=''
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
  };

  const size = isMobile ? 'small' : 'medium';

  if (isNFTLoading) {
    return <FullScreenLoader />;
  }

  return (
    <Layout>
      <div className={styles.content}>
        <form className={styles.form} onSubmit={formik.handleSubmit}>
          <div className={styles.formFields}>
            <div className={styles.leftColumn}>{renderAttachImage()}</div>
            <div className={styles.rightColumn}>
              <div className={styles.themeRow}>
                <OutlinedInput
                  id='theme'
                  label={t('theme')}
                  placeholder={t('enterTheme')}
                  size='small'
                  errorMessage={formik.errors.theme}
                  error={formik.touched.theme && Boolean(formik.errors.theme)}
                  className={styles.limitedWidth}
                  disabled={formik.isSubmitting}
                  {...formik.getFieldProps('theme')}
                />
                <IconButton
                  className={styles.closeButton}
                  onClick={() => navigate(RoutesEnum.root)}
                >
                  <CloseButtonIcon />
                </IconButton>
              </div>
              <Select
                id='nameOfDAOSlug'
                label={t('nameOfDAOSlug')}
                placeholder={t('enterNameOfDAO')}
                size='small'
                errorMessage={getIn(formik.errors, 'nameOfDAOSlug')}
                error={
                  getIn(formik.touched, 'nameOfDAOSlug') &&
                  Boolean(getIn(formik.touched, 'nameOfDAOSlug'))
                }
                disabled={formik.isSubmitting}
                items={daosForSelect}
                {...formik.getFieldProps('nameOfDAOSlug')}
              />
              <Select
                id='category'
                label={t('category')}
                placeholder={t('enterCategory')}
                size='small'
                errorMessage={formik.errors.category}
                error={
                  formik.touched.category && Boolean(formik.errors.category)
                }
                className={styles.limitedWidth}
                disabled={formik.isSubmitting}
                items={nftCategoriesForSelect(t)}
                {...formik.getFieldProps('category')}
              />
              <Select
                id='language'
                label={t('language')}
                placeholder={t('enterLanguage')}
                size='small'
                errorMessage={formik.errors.language}
                error={
                  formik.touched.language && Boolean(formik.errors.language)
                }
                className={styles.limitedWidth}
                disabled={formik.isSubmitting}
                items={nftLanguagesForSelect}
                {...formik.getFieldProps('language')}
              />
              <OutlinedInput
                id='description'
                label={t('description')}
                placeholder={t('describeInDetail')}
                multiline
                minRows={6}
                errorMessage={formik.errors.description}
                error={
                  formik.touched.description &&
                  Boolean(formik.errors.description)
                }
                disabled={formik.isSubmitting}
                {...formik.getFieldProps('description')}
              />
              {!id && (
                <div className={styles.tip}>
                  {t('toPostAnNFTYouNeedToGenerate')}
                </div>
              )}
            </div>
          </div>
          <div className={styles.buttons}>
            {!id && (
              <>
                <Button
                  size={size}
                  type='submit'
                  variant='contained'
                  loading={isMintNftNFTLoading}
                  className={styles.submitButton}
                  disabled={!formik.isValid || !!mintedNftNFTId}
                >
                  {t('mintNFTNft')}
                </Button>
                <Button
                  size={size}
                  type='submit'
                  variant='contained'
                  loading={isSaveNFTDataLoading}
                  className={styles.submitButton}
                  disabled={!formik.isValid || !mintedNftNFTId}
                >
                  {t('saveNFT')}
                </Button>
              </>
            )}
            {id && (
              <Button
                size={size}
                type='submit'
                variant='contained'
                loading={isEditNFTLoading}
                className={styles.submitButton}
                disabled={!formik.isValid}
              >
                {id ? t('editNFT') : t('addNFT')}
              </Button>
            )}
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default connector(AddOrEditNFTComponent);
