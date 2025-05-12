import { useState } from "react";
import { useForm } from "react-hook-form";
import { BsCloudUpload } from "react-icons/bs";
import { Spinner } from "flowbite-react";
import { useSession } from "next-auth/react";
import { ModalComp, UnauthorizedPage } from "../../../Components";
import UserLayout from "../../Layout/UserLayout";

import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import Image from "next/image";

import "react-quill/dist/quill.snow.css";

function IllustrationPage() {
  const { data: session } = useSession();
  const exclusivityValue = [`Free`, `Paid`];
  const [photo, setPhoto] = useState({ imgSrc: [], value: [] });
  const [modalData, setModalData] = useState({
    title: "",
    message: "",
    isOpen: false,
  });
  const [synopsisValue, setSynopsisValue] = useState("");
  const [isSpin, setIsSpin] = useState(() => false);

  const { register, handleSubmit } = useForm();

  const { onChange } = register("coverArt", {
    required: true,
    onChange: (e) => {
      const reader = new FileReader();

      reader.onload = () => {
        setPhoto({
          imgSrc: [reader.result],
          value: e.target.files[0],
        });
      };
      reader.readAsDataURL(e.target.files[0]);
    },
  });

  async function onSubmit(data) {
    data.synopsis = synopsisValue;
    data.createdBy = session.user.id;
    data.type = "illustration";

    if (photo.imgSrc.length > 0) {
      setIsSpin(true);

      const formData = new FormData();
      formData.append("upload_preset", "coverArt-preset");
      formData.append("file", photo.value);

      try {
        const coverUrl = await fetch(
          `https://api.cloudinary.com/v1_1/boednocomic/image/upload `,
          {
            method: "POST",
            body: formData,
          }
        ).then((r) => r.json());
        data.coverArt = coverUrl.secure_url;
        await fetch("/api/Comic/postIllust", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }).then((response) => {
          if (response.status === 200) {
            setTimeout(
              (window.location.href = `/follows/drafts/${session.user.id}`),
              3000
            );
            setModalData({
              title: "Success",
              message: `Illustration ${data.title} uploaded successfully`,
              isOpen: true,
            });
          } else if (response.status === 400) {
            setModalData({
              title: "Failure",
              message: `Illustration ${data.title} upload failed`,
              isOpen: true,
            });
          } else if (response.status === 500) {
            setModalData({
              title: "Failure",
              message: `Illustration ${data.title} upload failed`,
              isOpen: true,
            });
          }
        });
      } catch (error) {
        console.log(error);
      }
    }
  }

  if (session) {
    if (session.user.role === "user" && session.user.createdComic.length >= 5) {
      return (
        <div className="flex justify-center my-5">
          <h1 className="text-2xl font-bold">
            You have reached the maximum number of comics you can create
          </h1>
        </div>
      );
    } else {
      return (
        <>
          <div className="flex flex-col">
            <ModalComp modalData={modalData} setModalData={setModalData} />

            <form className="" onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col ">
                <div className="grid gap-x-6 grid-cols-1 lg:grid-cols-4">
                  <div className="my-2 col-span-3">
                    <h1 className="">Title</h1>
                    <input
                      {...register("title", { required: true })}
                      type={`text`}
                      name="title"
                      className=" bg-zinc-700 w-full focus:border-zinc-700 border-none rounded-md"
                      placeholder="Enter Title"
                    />
                  </div>
                  <div className="my-2 col-span-1">
                    <h1>Exclusivity</h1>
                    <select
                      {...register("exclusivity", { required: true })}
                      name="exclusivity"
                      required={true}
                      className="bg-zinc-700 w-full focus:border-zinc-700 border-none rounded-md"
                      id="exclusivity"
                    >
                      <option value="">Select</option>
                      {exclusivityValue.map((status, index) => (
                        <option key={index} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="my-2">
                  <h1 className="">Description</h1>
                  <input type="hidden" {...register("synopsis")} />
                  <ReactQuill
                    className="mt-2"
                    theme="snow"
                    value={synopsisValue}
                    onChange={setSynopsisValue}
                  />
                </div>

                <div className="my-2 border-t border-t-gray-600 flex mx-auto">
                  <div className={`mt-5 grid grid-cols-1 gap-2`}>
                    <div className="">
                      {photo.imgSrc.length > 0 && (
                        <Image
                          src={photo.imgSrc[0]}
                          alt="Cover Art"
                          width={200}
                          height={280}
                          className="rounded-lg "
                        />
                      )}
                    </div>
                    <label className="flex justify-center mb-2 px-4 transition bg-zinc-900 border-2 border-zinc-900 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-700 focus:outline-none">
                      <span className="flex items-center space-x-2 py-2 ">
                        <BsCloudUpload className="text-gray-500 text-xl" />
                        <span className="font-medium text-blue-600 hover:underline">
                          {" "}
                          Browse Files
                        </span>
                      </span>

                      <input
                        {...register("coverArt")}
                        type="file"
                        name="coverArt"
                        className="hidden"
                        accept=".jpg, .jpeg, .png"
                        onChange={onChange}
                      />
                    </label>
                  </div>
                </div>
                <div className="flex flex-row mx-auto bg-cyan-600 rounded-xl py-2 px-10">
                  <input
                    type="submit"
                    value={isSpin ? "Creating..." : "Create"}
                    className=" text-xl lg:text-2xl font-semibold uppercase cursor-pointer mx-5"
                  />
                  {isSpin && <Spinner size="lg" color="purple" />}
                </div>
              </div>
            </form>
          </div>
        </>
      );
    }
  } else {
    return <UnauthorizedPage />;
  }
}

export default IllustrationPage;

IllustrationPage.getLayout = function getLayout(page) {
  return UserLayout.getLayout(page);
};
