import { Modal } from "flowbite-react";
import { useState } from "react";
import UploadGallery from "./components/uploadGallery";
import { storage } from "./config/firebase";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import Loading from "./components/loading";
import UploadCamera from "./components/uploadCamera";
import isMobile from "./config/isMobile";

function App() {
  const [modalOpenTips, setModalOpenTips] = useState(false);
  const [modalOpenMeasure, setModalOpenMeasure] = useState(false);
  const [isLoadingUpload, setIsLoadingUpload] = useState(false);
  const [isLoadingMeasure, setIsLoadingMeasure] = useState(false);
  const [measuredImage, setMeasuredImage] = useState("");

  const handleUpload = (file) => {
    setModalOpenMeasure(false);
    console.log(file, "halo");

    if (!file) return;
    setIsLoadingUpload(true);
    const storageRef = ref(storage, `${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {},
      (error) => {
        alert(error);
        setIsLoadingUpload(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setIsLoadingUpload(false);
          setIsLoadingMeasure(true);
          var myHeaders = new Headers();
          myHeaders.append("Access-Control-Allow-Origin", "*");
          myHeaders.append("Content-Type", "application/json");

          var raw = JSON.stringify({
            url_image: downloadURL,
          });

          var requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
          };

          fetch(
            "http://dafazakhulhaq.pythonanywhere.com/analize_image",
            requestOptions
          )
            .then((response) => response.json())
            .then((result) => setMeasuredImage(result.file))
            .catch((error) => console.log("error", error))
            .finally(() => setIsLoadingMeasure(false));
        });
      }
    );
  };

  const downloadImage = () => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      file_name: measuredImage,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(
      "http://dafazakhulhaq.pythonanywhere.com/download_image",
      requestOptions
    )
      .then((response) => response.blob())
      .then((blob) => {
        var file = window.URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = file;
        a.download = "measured_image.jpg";
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((error) => console.log("error", error));
  };

  return (
    <div className="container mx-auto h-screen w-full flex justify-center items-center flex-col">
      <img src="assets/img/ruller.svg" alt="icon" className="w-16" />
      <h1 className="mt-2 font-semibold text-2xl">Measure App</h1>
      {isLoadingUpload ? (
        <Loading type="Uploading" />
      ) : isLoadingMeasure ? (
        <Loading type="Measuring" />
      ) : (
        <>
          {measuredImage ? (
            <>
              {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
              <img
                height={400}
                width={300}
                className="p-3 mt-5 border-solid border-2 border-black"
                src={`https://dafazakhulhaq.pythonanywhere.com/static/images/${measuredImage}`}
                alt="measured image"
              />
              <button
                onClick={() => downloadImage()}
                className="mt-5 px-10 rounded py-3 bg-black text-white flex justify-center items-center cursor-pointer"
              >
                Download
              </button>
              <button
                onClick={() => window.location.reload()}
                className="mt-5 px-10 rounded py-3 bg-green-500 text-white flex justify-center items-center cursor-pointer"
              >
                Re Measure
              </button>
            </>
          ) : (
            <>
              <p className="mt-4 font-light text-sm opacity-50 text-center px-4">
                Click the button below and upload the image you want to measure,
                before measuring it's better to see the tips first
              </p>
              <div
                className="blob cursor-pointer"
                onClick={() => setModalOpenMeasure(true)}
              >
                <p className="font-normal text-base">Measure</p>
              </div>
              <button
                onClick={() => setModalOpenTips(true)}
                className="mt-20 w-16 h-16 rounded-full bg-black text-white flex justify-center items-center cursor-pointer"
              >
                ?
              </button>
            </>
          )}
        </>
      )}

      <Modal
        position="center"
        show={modalOpenMeasure}
        onClose={() => setModalOpenMeasure(false)}
      >
        <Modal.Header>Choose Image</Modal.Header>
        <Modal.Body>
          <UploadGallery onChange={handleUpload} />
          {isMobile.any() ? <UploadCamera onChange={handleUpload} /> : null}
        </Modal.Body>
      </Modal>

      <Modal
        show={modalOpenTips}
        onClose={() => setModalOpenTips(false)}
        dismissible
      >
        <Modal.Header>Tips</Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
              With less than a month to go before the European Union enacts new
              consumer privacy laws for its citizens, companies around the world
              are updating their terms of service agreements to comply.
            </p>
            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
              The European Union’s General Data Protection Regulation (G.D.P.R.)
              goes into effect on May 25 and is meant to ensure a common set of
              data rights in the European Union. It requires organizations to
              notify users as soon as possible of high-risk data breaches that
              could personally affect them.
            </p>
            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
              With less than a month to go before the European Union enacts new
              consumer privacy laws for its citizens, companies around the world
              are updating their terms of service agreements to comply.
            </p>
          </div>
          <button
            onClick={() => setModalOpenTips(false)}
            className="mt-10 px-10 rounded py-3 bg-black text-white flex justify-center items-center cursor-pointer"
          >
            Understand
          </button>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default App;
