import { Close, Send, Upload } from "@mui/icons-material";
import { useRef, useState } from "react";
import JoditEditor from "jodit-react";
import { useTitle } from "../../Hooks/useTitle";
import { Taglist } from "../../components/TagList";
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Tooltip,
} from "@mui/material";
import { useToken } from "../../Hooks/useToken";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { newBlog, uploadPhoto } from "../../api/api";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const Loading = () => {
  return (
    <>
      <div className="font-noto flex flex-row gap-3 items-center px-4 py-2 text-white bg-indigo-500 rounded-md text-sm sm:text-base select-none ">
        <span>Publishing</span>
        <CircularProgress thickness={4} size={30} sx={{ color: "white" }} />
      </div>
    </>
  );
};

export const NewBlog = () => {
  useTitle("New Blog");

  const [isLoading, setLoading] = useState(false);
  const [uploadFile, setuploadFile] = useState(null);

  const [data, setData] = useState({
    content: "",
    title: "",
    tag: "",
    thumbnail: null,
  });

  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };

  const editor = useRef(null);

  const token = useToken();

  const uploadThumbnail = () => {
    if (uploadFile !== null) {
      const formdata = new FormData();
      formdata.append("file", uploadFile);
      formdata.append("upload_preset", import.meta.env.VITE_UPLOAD_PRESET);
      uploadPhoto(formdata)
        .then((res) => {
          setData({ ...data, thumbnail: res.data?.public_id });
        })
        .catch(() => {});
    }
  };

  const navi = useNavigate();
  const handlePublish = () => {
    if (
      data.content.length === 0 ||
      data.title.length === 0 ||
      data.tag.length === 0
    ) {
      setOpen(true);
    } else {
      setLoading(true);
      const formdata = new FormData();
      formdata.append("content", data?.content);
      formdata.append("tag", data?.tag);
      formdata.append("title", data?.title);
      formdata.append("thumbnail", data?.thumbnail);
      newBlog(token, formdata)
        .then(() => {
          toast.success("Blog Added Successfully.");
          setTimeout(() => {
            navi("/");
          }, 1500);
        })
        .catch(() => {
          toast.error("Some Error Occured.");
        });
    }
  };

  const handleThumbnail = (e) => {
    setuploadFile(e.target.files[0]);
    setTimeout(() => {
      uploadThumbnail();
    }, 2000);
  };

  return (
    <div className="flex flex-col justify-center items-center w-full my-4">
      <ToastContainer
        position="top-center"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
        theme="colored"
      />
      <div className="flex flex-col flex-wrap gap-6 w-[95%] md:w-[50%]">
        <div className="flex flex-row justify-between items-center">
          <div className="font-gara text-2xl md:text-4xl font-bold border-b-4 py-1 border-b-indigo-600 pe-6 select-none">
            Create New Blog
          </div>
          {!isLoading ? (
            <button
              type="button"
              onClick={handlePublish}
              className="font-noto flex flex-row gap-3 items-center px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-800 transition-colors text-sm sm:text-base"
            >
              <span>Publish</span>
              <Send sx={{ fontSize: 17 }} />
            </button>
          ) : (
            <Loading />
          )}
        </div>

        {uploadFile === null ? (
          <>
            <span className="text-red-600 font-spec text-sm">
              Once Thumbnail Uploaded it cannot be Undone. *
            </span>
            <div className="flex flex-wrap w-full flex-row gap-4 items-center border-2 border-gray-400 rounded-lg p-3 md:p-5 -mt-6 justify-center">
              <Upload />
              <input
                type="file"
                accept=".png,.jpg,.jpeg"
                name="fileupload"
                id=""
                title="Upload Blog Thumbnail"
                max={1}
                onChange={handleThumbnail}
                className="w-[100px]"
              />
              <span className="font-raj font-bold text-base">
                Upload Blog Thumbnail Here
              </span>
            </div>
          </>
        ) : (
          <Tooltip title="Blog Thumbnail" followCursor placement="top">
            <div className="flex flex-col justify-center items-center">
              <img src={URL.createObjectURL(uploadFile)} />
            </div>
          </Tooltip>
        )}
        <TextField
          placeholder="Enter Blog Title"
          onChange={(e) => {
            setData({ ...data, title: e.target.value });
          }}
          required
          inputProps={{ className: "font-gara text-2xl" }}
        />
        <JoditEditor
          ref={editor}
          value={data.content}
          config={{
            buttons:
              "bold,italic,underline,strikethrough,ul,ol,font,fontsize,paragraph,lineHeight,superscript,subscript,image,cut,copy,paste,selectall,hr,table,preview",
            enter: "p",
            height: "600px",
            width: "auto",
            toolbarAdaptive: false,
            toolbarButtonSize: "large",
            iframe: true,
            hidePoweredByJodit: true,
          }}
          tabIndex={1}
          onBlur={(newContent) => setData({ ...data, content: newContent })}
        />
        <Taglist selected={setData} data={data} />
      </div>
      <Dialog
        open={open}
        keepMounted
        onClose={handleClose}
        fullWidth
        aria-describedby="alert-dialog-slide-description"
        color="red"
      >
        <DialogTitle>
          <div className="flex flex-row justify-between text-xl font-bold">
            <span className="font-gara text-lg space-x-2 flex flex-row items-center">
              <span>Field Empty </span>
              <AiOutlineExclamationCircle fontSize={25} />
            </span>
            <span>
              <button type="button" onClick={handleClose}>
                <Close />
              </button>
            </span>
          </div>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description" fontSize={17}>
            <span className="font-noto">
              Check The Title, Content and Tag if you left it Blank or Not.
            </span>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <button
            className="font-spec text-lg font-bold px-3 py-1 m-3 bg-indigo-100 text-indigo-600 rounded-md hover:bg-indigo-200 transition-{bg} ease-in-out duration-200"
            type="button"
            onClick={handleClose}
          >
            OK
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
