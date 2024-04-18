import React, { useEffect, useState } from 'react';

import {
  Layout, OutlinedInput, Button, IconButton, FullScreenLoader, Select,
} from 'common';
import Dropzone from 'react-dropzone';
import { ConnectedProps, connect } from 'react-redux';
import { RootState } from 'application/store';
import {
  CloseButtonIcon, ImagePlusIcon,
} from 'assets/icons';
import {
  getIn,
  useFormik,
} from 'formik';
import { mintNftTrigger, saveNFTDataTrigger, loadNFTTrigger } from 'NFTs/slice/NFTsSlice';
import { getWalletAddress } from 'account/selectors/accountSelectors';
import * as yup from 'yup';
import { checkIfLoading } from 'network/selectors';
import { push } from 'connected-react-router';
import { isMobile } from 'application/components/App';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { RoutesEnum } from 'application/typings/routes';
import { RouteComponentProps } from 'react-router';
import { getNFT } from 'NFTs/selectors/NFTsSelectors';
import {
  pick,
} from 'lodash';
import { downloadFile } from 'api/openResty';
import { Clear as ClearIcon } from '@mui/icons-material';
import { nftCategoriesForSelect, nftLanguagesForSelect } from 'NFTs/constants';
import { daosForSelect } from 'application/constants';
import styles from './AddOrEditNFTPage.module.scss';
import { editNFTTrigger } from '../../../slice/NFTsSlice';

const initialValues = {
  language: '',
  theme: '',
  nameOfDAOSlug: '',
  category: '',
  description: '',
};

type InitialValues = typeof initialValues;

type OwnProps = RouteComponentProps<{ idAndSlug?: string }>;

const mapDispatchToProps = {
  mintNftTrigger,
  saveNFTDataTrigger,
  routeTo: push,
  loadNFTTrigger,
  editNFTTrigger,
};

const mapStateToProps = (state: RootState, props: OwnProps) => {
  const id = props?.match?.params?.idAndSlug?.match(/^\d+/)?.[0];
  return ({
    id,
    walletAddress: getWalletAddress(state),
    isMintNftNFTLoading: checkIfLoading(state, mintNftTrigger.type),
    isSaveNFTDataLoading: checkIfLoading(state, saveNFTDataTrigger.type),
    isEditNFTLoading: checkIfLoading(state, editNFTTrigger.type),
    isNFTLoading: checkIfLoading(state, loadNFTTrigger.type),
    NFT: getNFT(state),
  });
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type AddOrEditNFTComponentProps = ConnectedProps<typeof connector>;

const AddOrEditNFTComponent: React.FC<AddOrEditNFTComponentProps> = ({
  id,
  mintNftTrigger,
  saveNFTDataTrigger,
  isMintNftNFTLoading,
  isSaveNFTDataLoading,
  isEditNFTLoading,
  isNFTLoading,
  routeTo,
  NFT,
  loadNFTTrigger,
  editNFTTrigger,
}) => {
  const { t } = useTranslation();
  const [mintedNftNFTId, setMintedNftNFTId] = useState<number | null>(null);

  const [images, setImages] = useState<File[]>([]);

  useEffect(() => {
    if (id) {
      loadNFTTrigger({ id, isDraft: true });
    }
  }, []);

  const getValidationSchema = () => yup.object({
    language: yup
      .string()
      .required(t('requiredField')),
    theme: yup
      .string()
      .required(t('requiredField'))
      .max(140, ({ max }) => t('noMoreCharacters', { max })),
    category: yup
      .string()
      .required(t('requiredField')),

    description: yup
      .string()
      .max(560, ({ max }) => t('noMoreCharacters', { max })),
  });

  const handleSubmit = async ({ ...values }: InitialValues) => {
    if (!images.length) return toast.error(t('addImageRequestError'));

    if (id) {
      return editNFTTrigger({
        id: +id,
        ...values,
        image: images[0],
        walletAddress: NFT?.walletAddress,
      });
    }
    if (!mintedNftNFTId) {
      return mintNftTrigger({
        ...values,
        additionalActionOnSuccess: (NFTId) => {
          setMintedNftNFTId(NFTId as number);
        },
      });
    }

    return saveNFTDataTrigger({
      id: mintedNftNFTId,
      image: images[0],
      theme: values.theme,
    });
  };

  const formik = useFormik({
    initialValues,
    onSubmit: handleSubmit,
    validationSchema: getValidationSchema(),
  });

  useEffect(() => {
    if (NFT && id) {
      if (NFT?.imageHash && id) {
        downloadFile(NFT.imageHash, id).then((file) => {
          if (file) setImages([file]);
        });
      }

      formik.setValues(pick(
        NFT,
        'language',
        'theme',
        'nameOfDAOSlug',
        'category',
        'description',
      ));
    }
  }, [NFT]);

  const onDropImages = (images: any) => {
    setImages(images);
  };

  const onClickClear = () => {
    setImages([]);
  };

  const renderAttachImage = () => {
    if ((images.length)) {
      return <>
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
      </>;
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
      </Dropzone>);
  };

  const size = isMobile ? 'small' : 'medium';

  if (isNFTLoading) {
    return (
      <FullScreenLoader />
    );
  }

  return (
    <Layout>
      <div className={styles.content}>
        <form className={styles.form} onSubmit={formik.handleSubmit}>

          <div className={styles.formFields}>
            <div className={styles.leftColumn}>
              {renderAttachImage()}
            </div>
            <div className={styles.rightColumn}>
              <div className={styles.themeRow}>
                <OutlinedInput
                  id="theme"
                  label={t('theme')}
                  placeholder={t('enterTheme')}
                  size="small"
                  errorMessage={formik.errors.theme}
                  error={formik.touched.theme && Boolean(formik.errors.theme)}
                  className={styles.limitedWidth}
                  disabled={formik.isSubmitting}
                  {...formik.getFieldProps('theme')}
                />
                <IconButton
                  className={styles.closeButton}
                  onClick={() => routeTo(RoutesEnum.root)}
                >
                  <CloseButtonIcon />
                </IconButton>
              </div>
              <Select
                id="nameOfDAOSlug"
                label={t('nameOfDAOSlug')}
                placeholder={t('enterNameOfDAO')}
                size="small"
                errorMessage={getIn(formik.errors, 'nameOfDAOSlug')}
                error={getIn(formik.touched, 'nameOfDAOSlug') && Boolean(getIn(formik.touched, 'nameOfDAOSlug'))}
                disabled={formik.isSubmitting}
                items={daosForSelect}
                {...formik.getFieldProps('nameOfDAOSlug')}
              />
              <Select
                id="category"
                label={t('category')}
                placeholder={t('enterCategory')}
                size="small"
                errorMessage={formik.errors.category}
                error={formik.touched.category && Boolean(formik.errors.category)}
                className={styles.limitedWidth}
                disabled={formik.isSubmitting}
                items={nftCategoriesForSelect(t)}
                {...formik.getFieldProps('category')}
              />
              <Select
                id="language"
                label={t('language')}
                placeholder={t('enterLanguage')}
                size="small"
                errorMessage={formik.errors.language}
                error={formik.touched.language && Boolean(formik.errors.language)}
                className={styles.limitedWidth}
                disabled={formik.isSubmitting}
                items={nftLanguagesForSelect}
                {...formik.getFieldProps('language')}
              />
              <OutlinedInput
                id="description"
                label={t('description')}
                placeholder={t('describeInDetail')}
                multiline
                minRows={6}
                errorMessage={formik.errors.description}
                error={formik.touched.description && Boolean(formik.errors.description)}
                disabled={formik.isSubmitting}
                {...formik.getFieldProps('description')}
              />
              {!id && <div className={styles.tip}>{t('toPostAnNFTYouNeedToGenerate')}</div>}
            </div>
          </div>
          <div className={styles.buttons}>
            {!id && <>
              <Button
                size={size}
                type="submit"
                variant="contained"
                loading={isMintNftNFTLoading}
                className={styles.submitButton}
                disabled={!formik.isValid || !!mintedNftNFTId}
              >
                {t('mintNFTNft') }
              </Button>
              <Button
                size={size}
                type="submit"
                variant="contained"
                loading={isSaveNFTDataLoading}
                className={styles.submitButton}
                disabled={!formik.isValid || !mintedNftNFTId}
              >
                {t('saveNFT') }
              </Button>
            </> }
            {id && <Button
              size={size}
              type="submit"
              variant="contained"
              loading={isEditNFTLoading}
              className={styles.submitButton}
              disabled={!formik.isValid}
            >
              {id ? t('editNFT') : t('addNFT')}
            </Button>}
          </div>
        </form>
      </div>
    </Layout>
  );
};

export const AddOrEditNFTPage = connector(AddOrEditNFTComponent);
