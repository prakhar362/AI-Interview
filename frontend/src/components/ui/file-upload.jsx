import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import { cn } from "../../lib/utils";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

export const FileUpload = ({
  onChange,
  accept,
  maxFiles = 1
}) => {
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (newFiles) => {
    setFiles((prevFiles) => [...newFiles]);
    if (onChange) {
      onChange(newFiles);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    noClick: true,
    maxFiles: maxFiles,
    accept: accept,
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.log(error);
    },
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="p-8 group/file block rounded-3xl cursor-pointer w-full relative overflow-hidden bg-white border border-dashed border-black/15 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:border-[#22F5B5] transition-colors"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          accept={accept ? Object.keys(accept).join(",") : undefined}
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />

        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none">
          <GridPattern />
        </div>

        <div className="flex flex-col items-center justify-center">
          <p className="relative z-20 font-black text-[#111111] text-base">
            Upload Candidate Resume
          </p>
          <p className="relative z-20 font-medium text-[#666666] text-xs mt-1">
            Drag & drop your PDF resume here or click to browse
          </p>

          <div className="relative w-full mt-6 max-w-xl mx-auto">
            {files.length > 0 &&
              files.map((file, idx) => (
                <motion.div
                  key={"file-select-" + idx}
                  layoutId={idx === 0 ? "file-upload" : "file-upload-" + idx}
                  className={cn(
                    "relative z-30 bg-white border border-black/10 flex flex-col items-start justify-start md:h-24 p-4 mt-4 w-full mx-auto rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
                  )}
                >
                  <div className="flex justify-between w-full items-center gap-4">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="text-sm text-[#111111] font-bold truncate max-w-xs"
                    >
                      {file.name}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="text-xs text-[#111111] px-2.5 py-1 rounded-full bg-[#22F5B5]/20 border border-[#22F5B5]/40 font-bold shrink-0"
                    >
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </motion.p>
                  </div>

                  <div className="flex text-xs md:flex-row flex-col items-start md:items-center w-full mt-2 justify-between text-[#666666]">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="px-2 py-0.5 rounded-md bg-[#F6F6F6] text-[10px] font-semibold text-zinc-600 border border-black/5"
                    >
                      {file.type || "pdf"}
                    </motion.p>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="text-[10px] text-zinc-500 font-medium"
                    >
                      modified {new Date(file.lastModified).toLocaleDateString()}
                    </motion.p>
                  </div>
                </motion.div>
              ))}

            {!files.length && (
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn(
                  "relative z-30 bg-white border border-black/10 flex items-center justify-center h-28 mt-4 w-full max-w-[8rem] mx-auto rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] group-hover/file:shadow-xl transition-all"
                )}
              >
                {isDragActive ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-[#111111] font-bold flex flex-col items-center gap-1"
                  >
                    Drop it!
                    <IconUpload className="h-5 w-5 text-[#111111]" />
                  </motion.p>
                ) : (
                  <IconUpload className="h-6 w-6 text-[#111111] group-hover/file:text-black transition-colors" />
                )}
              </motion.div>
            )}

            {!files.length && (
              <motion.div
                variants={secondaryVariant}
                className="absolute opacity-0 border border-dashed border-[#22F5B5] inset-0 z-20 flex items-center justify-center h-28 w-full max-w-[8rem] mx-auto rounded-2xl bg-[#22F5B5]/10"
              ></motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-zinc-50 shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105 pointer-events-none opacity-50">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-white"
                  : "bg-zinc-100 shadow-[inset_0_0_1px_1px_rgba(0,0,0,0.02)]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}
