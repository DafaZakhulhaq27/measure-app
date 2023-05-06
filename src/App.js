import { Modal } from "flowbite-react";
import jsPDF from "jspdf";
import { useEffect, useState } from "react";
import UploadGallery from "./components/uploadGallery";
import { storage } from "./config/firebase";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import Loading from "./components/loading";
import UploadCamera from "./components/uploadCamera";
import isMobile from "./config/isMobile";

const A4_PAPER_DIMENSIONS = {
  width: 210,
  height: 297,
};

const A4_PAPER_RATIO = A4_PAPER_DIMENSIONS.width / A4_PAPER_DIMENSIONS.height;

{
  /* <option value={0.06}>18</option>
<option value={0.055}>19</option>
<option value={0.05}>20</option>
<option value={0.045}>21</option>
<option value={0.04}>22</option>
<option value={0.035}>23</option>
<option value={0.03}>24</option> */
}

const convertDistance = (v) => {
  switch (v) {
    case "0.07":
      return "16";
    case "0.065":
      return "17";
    case "0.06":
      return "18";
    case "0.055":
      return "19";
    case "0.05":
      return "20";
    case "0.045":
      return "21";
    case "0.04":
      return "22";
    case "0.035":
      return "23";
    case "0.03":
      return "24";
    default:
      return "0";
  }
};

function App() {
  // modal
  const [modalOpenTips, setModalOpenTips] = useState(false);
  const [modalOpenSetting, setModalOpenSetting] = useState(false);
  const [modalOpenMeasure, setModalOpenMeasure] = useState(false);

  const [isLoadingUpload, setIsLoadingUpload] = useState(false);
  const [isLoadingMeasure, setIsLoadingMeasure] = useState(false);
  const [measuredImage, setMeasuredImage] = useState("");

  // dark theme
  const [isDark, setIsDark] = useState(false);

  // calibration
  const [distance, setDistance] = useState("0.04");

  useEffect(() => {
    setModalOpenTips(true);
  }, []);

  const imageDimensionsOnA4 = (dimensions) => {
    const isLandscapeImage = dimensions.width >= dimensions.height;

    // If the image is in landscape, the full width of A4 is used.
    if (isLandscapeImage) {
      return {
        width: A4_PAPER_DIMENSIONS.width,
        height:
          A4_PAPER_DIMENSIONS.width / (dimensions.width / dimensions.height),
      };
    }

    // If the image is in portrait and the full height of A4 would skew
    // the image ratio, we scale the image dimensions.
    const imageRatio = dimensions.width / dimensions.height;
    if (imageRatio > A4_PAPER_RATIO) {
      const imageScaleFactor =
        (A4_PAPER_RATIO * dimensions.height) / dimensions.width;

      const scaledImageHeight = A4_PAPER_DIMENSIONS.height * imageScaleFactor;

      return {
        height: scaledImageHeight,
        width: scaledImageHeight * imageRatio,
      };
    }

    // The full height of A4 can be used without skewing the image ratio.
    return {
      width:
        A4_PAPER_DIMENSIONS.height / (dimensions.height / dimensions.width),
      height: A4_PAPER_DIMENSIONS.height,
    };
  };

  const handleUpload = (file) => {
    setModalOpenMeasure(false);

    if (!file) return;

    if (file.type !== "image/jpeg") {
      alert("hanya menerima format gambar Jpeg/Jpg");
      return;
    }

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
            calibration: parseFloat(distance),
          });

          var requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
          };

          fetch(
            "http://measure.pythonanywhere.com/analize_image",
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

  const downloadImagetoPDF = () => {
    const doc = new jsPDF();
    doc.deletePage(1);

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

    fetch("http://measure.pythonanywhere.com/download_image", requestOptions)
      .then((response) => response.blob())
      .then((blob) => {
        var file = window.URL.createObjectURL(blob);
        var file_object = new File([blob], "image.jpg", {
          type: "application/jpeg",
        });

        const imageDimensions = imageDimensionsOnA4({
          width: file.width,
          height: file.height,
        });

        doc.addPage();
        doc.addImage(
          file,
          "image/jpeg",
          // Images are vertically and horizontally centered on the page.
          0,
          0,
          200,
          200
        );

        const pdfURL = doc.output("bloburl");
        window.open(pdfURL, "_blank");
      })
      .catch((error) => console.log("error", error));
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

    fetch("http://measure.pythonanywhere.com/download_image", requestOptions)
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
    <div className={isDark ? "bg-black text-white" : "bg-white text-black"}>
      <div className="container mx-auto h-screen w-full flex justify-center items-center flex-col">
        <img
          src={`/assets/img/ruller${isDark ? "-white" : ""}.svg`}
          alt="icon"
          className="w-16"
        />
        <h1 className="mt-2 font-semibold text-2xl">Measure App</h1>
        {isLoadingUpload ? (
          <Loading type="Uploading" isDark={isDark} />
        ) : isLoadingMeasure ? (
          <Loading type="Measuring" isDark={isDark} />
        ) : (
          <>
            {measuredImage ? (
              <>
                {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                <img
                  height={400}
                  width={300}
                  className="p-3 mt-5 border-solid border-2 border-black"
                  src={`http://measure.pythonanywhere.com/static/images/${measuredImage}`}
                  alt="measured image"
                />

                <p>With Calibration : {convertDistance(distance)} px/cm</p>

                <button
                  onClick={() => downloadImage()}
                  className="mt-5 px-10 rounded py-3 bg-black text-white flex justify-center items-center cursor-pointer"
                >
                  Download
                </button>
                <button
                  onClick={() => downloadImagetoPDF()}
                  className="mt-5 px-10 rounded py-3 bg-orange-800	 text-white flex justify-center items-center cursor-pointer"
                >
                  Generate PDF
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
                  Click the button below and upload the image you want to
                  measure, before measuring it's better to see the tips first
                </p>
                <div
                  className={`${isDark ? "blob-dark" : "blob"} cursor-pointer`}
                  onClick={() => setModalOpenMeasure(true)}
                >
                  <p className={`font-normal text-base `}>Measure</p>
                </div>
                <div className="flex flex-row gap-5">
                  <button
                    onClick={() => setModalOpenTips(true)}
                    className={`mt-20 w-16 h-16 rounded-full bg-black text-white border ${
                      isDark ? "border-white " : "  "
                    }flex justify-center items-center cursor-pointer`}
                  >
                    ?
                  </button>
                  <button
                    onClick={() => setIsDark(!isDark)}
                    className={`mt-20 w-16 h-16 rounded-full ${
                      isDark
                        ? "bg-black text-white border-white"
                        : "bg-white text-black border-black"
                    } border flex justify-center items-center cursor-pointer`}
                  >
                    {isDark ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                        />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => setModalOpenSetting(true)}
                    className={`mt-20 w-16 h-16 rounded-full bg-black text-white border ${
                      isDark ? "border-white " : "  "
                    }flex justify-center items-center cursor-pointer`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                      />
                    </svg>
                  </button>
                </div>
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
          position="center"
          show={modalOpenSetting}
          dismissible
          onClose={() => setModalOpenSetting(false)}
        >
          <Modal.Header>Setting</Modal.Header>
          <Modal.Body>
            <label htmlFor="distance" className="mr-4">
              Callibration
            </label>
            <select
              class="form-select px-4 py-3 rounded-full"
              id="distance"
              defaultValue={0.04}
              onChange={(e) => setDistance(e.target.value)}
            >
              <option value={0.07}>16</option>
              <option value={0.065}>17</option>
              <option value={0.06}>18</option>
              <option value={0.055}>19</option>
              <option value={0.05}>20</option>
              <option value={0.045}>21</option>
              <option value={0.04}>22</option>
              <option value={0.035}>23</option>
              <option value={0.03}>24</option>
              <option value={0.025}>25</option>
              <option value={0.02}>26</option>
              <option value={0.015}>27</option>
              <option value={0.01}>28</option>
            </select>
            <span className="ml-4">px/cm</span>
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
                Ikuti Tips berikut untuk mendapatkan hasil pengukuran yang lebih
                akurat
              </p>
              <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                1. Letakan object tegak lurus dengan kamera
              </p>
              <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                2. warna latar belakang dan object harus berbeda. Contoh apabila
                object berwarna cenderung gelap maka latar belakang harus putih
              </p>
              <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                3. Untuk permukaan object usahakan tidak terlalu banyak corak
                dan tulisan (jika polos lebih bagus)
              </p>
              <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                4. Harus memfoto object lurus/ tidak boleh miring
              </p>
              <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                5. Jarak antara object dan kamera ikuti pada menu kalibrasi,
                defaultnya adalah 50cm.
              </p>
            </div>
            <button
              onClick={() => setModalOpenTips(false)}
              className="mt-10 px-10 rounded py-3 bg-black text-white flex justify-center items-center cursor-pointer"
            >
              Mengerti
            </button>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}

export default App;
