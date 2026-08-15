import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Image, message, Upload } from "antd";
import type { GetProp, UploadFile, UploadProps } from "antd";
import { useMutation } from "react-query";
import { channelApi } from "../../apis/channel.api";
import styles from "./UploadMultipleFile.module.scss";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

interface Props {
  onSubmit: (fileList: UploadFile[]) => void;
  fileList: UploadFile[];
  setFileList: (fileList: UploadFile[]) => void;
}

export interface UploadMultipleFile {
  handleClick: (channel_id: string) => void;
}

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const UploadMutipleFile = forwardRef(({ onSubmit, fileList, setFileList }: Props, ref) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const [channelId, setChannelId] = useState<string>("");

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => setFileList(newFileList);

  useImperativeHandle<any, UploadMultipleFile>(
    ref,
    () => ({
      handleClick(channelId: string) {
        setChannelId(channelId);
        inputRef.current?.click();
      },
    }),
    [],
  );

  const uploadFile = useMutation({
    mutationFn: ({ formData, channelId }: { formData: FormData; channelId: string }) =>
      channelApi.upload(channelId, formData),
  });

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    console.log("files", files);

    if (!files) return;

    const selectedFiles = Array.from(files);

    if (fileList.length + selectedFiles.length > 4) {
      message.error({
        content: "Vượt quá giới hạn 4 files",
      });
      return;
    }

    const uploadFiles = await Promise.all(
      selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file as Blob);

        const res = await uploadFile.mutateAsync({
          formData,
          channelId: channelId,
        });

        const data = res.data.data;

        const uploadedFile: UploadFile = {
          uid: data.id,
          name: data.name,
          status: "done",
          url: data.url,
          size: data.size,
          type: data.type,
        };
        return uploadedFile;
      }),
    );

    const listFileNew = [...fileList, ...uploadFiles];
    setFileList(listFileNew);
    onSubmit(listFileNew);
  };

  return (
    <div>
      <input ref={inputRef} type="file" multiple hidden onChange={handleInputChange} />

      {fileList.length > 0 && (
        <div className={styles.upload}>
          <Upload
            listType="picture-card"
            fileList={fileList}
            onPreview={handlePreview}
            onChange={handleChange}
          />
        </div>
      )}

      {previewImage && (
        <Image
          styles={{ root: { display: "none" } }}
          preview={{
            open: previewOpen,
            onOpenChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(""),
          }}
          src={previewImage}
        />
      )}
    </div>
  );
});

export default UploadMutipleFile;
