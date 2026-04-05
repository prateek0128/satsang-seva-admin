import { Carousel } from "bootstrap";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";

const ImageCarousel = ({ className = "", ytLink, imgLinks }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [len, setLen] = useState(0);
  const carouselRef = React.createRef();

  useEffect(() => {
    let carousel;
    if (carouselRef.current) {
      try {
        carousel = new Carousel(carouselRef.current, {
          interval: 2000,
        });
      } catch (error) {
        console.error("Carousel initialization error:", error);
      }
    }
    return () => {
      if (carousel) {
        carousel.dispose();
      }
    };
  }, [carouselRef]);

  useEffect(() => {
    if (ytLink === "404") {
      setLen(imgLinks.length);
    } else {
      setLen(imgLinks.length + 1);
    }
  }, [ytLink, imgLinks]);

  const handleNext = () => {
    setCurrentIndex((currentIndex + 1) % len);
  };

  const handlePrev = () => {
    setCurrentIndex((currentIndex - 1 + len) % len);
  };

  return (
    <section
      className={`self-stretch flex flex-row items-start justify-center pt-0 pb-0 pr-5 pl-[21px] box-border max-w-full mq750:box-border`}
    >
      <div className="w-[1199px] flex flex-col items-start justify-start gap-[39px] max-w-full mq750:gap-[19px]">
        <div className="w-[255px] flex flex-row items-start justify-start gap-[23px]"></div>
        <div className="self-stretch rounded-xl bg-orange flex flex-row items-start justify-start relative max-w-full">
          <div
            className="carousel slide carousel-fade w-full h-[460px] relative"
            ref={carouselRef}
            id="carouselExampleControls"
            data-bs-ride="carousel"
            data-bs-interval="7000"
          >
            <div
              className="carousel-inner relative w-full overflow-hidden"
              style={{ scrollBehavior: "smooth" }}
            >
              {ytLink && ytLink !== "404" && (
                <div
                  className={`carousel-item ${
                    currentIndex === len - 1 ? "active" : ""
                  } w-full h-[460px] relative`}
                >
                  <iframe
                    className="h-[460px] w-full relative rounded-xl max-w-full overflow-hidden"
                    src={`https://www.youtube.com/embed/${ytLink}`}
                    title="Live Satsang Event"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    onError={(e) => {
                      console.error("Error loading YouTube video:", ytLink);
                    }}
                  />
                </div>
              )}
              {imgLinks.map((imgLink, index) => (
                <div
                  key={index}
                  className={`carousel-item ${
                    currentIndex === index ? "active" : ""
                  } w-full h-[460px] relative rounded-xl overflow-hidden`}
                >
                  <img
                    src={imgLink}
                    alt="EventPoster"
                    className="h-[460px] w-full relative rounded-xl max-w-full overflow-hidden"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/1199x460?text=Image+Not+Available";
                      console.error("Error loading image:", imgLink);
                    }}
                  />
                </div>
              ))}
            </div>
            {imgLinks.length > 1 && (
              <>
                <button
                  className="carousel-prev absolute top-0 left-0 z-30 flex items-center justify-center w-10 h-10 text-white cursor-pointer"
                  style={{
                    borderTopLeftRadius: "1rem",
                    backgroundColor: "rgba(0,0,0,0.4)",
                  }}
                  onClick={handlePrev}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  className="carousel-next absolute top-0 right-0 z-30 flex items-center justify-center w-10 h-10 text-white cursor-pointer"
                  style={{
                    borderTopRightRadius: "1rem",
                    backgroundColor: "rgba(0,0,0,0.4)",
                  }}
                  onClick={handleNext}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

ImageCarousel.propTypes = {
  className: PropTypes.string,
};

export default ImageCarousel;

/**--------------------------------------------------------------------------------------------------------- */

// import { Carousel } from "bootstrap";
// import PropTypes from "prop-types";
// import React, { useEffect, useState, useRef } from "react";

// const imageCarousel = ({ className = "", ytLink, imgLinks }) => {
//   const [len, setLen] = useState(0);
//   const carouselRef = useRef(null);
//   const carouselInstance = useRef(null);

//   useEffect(() => {
//     if (carouselRef.current) {
//       try {
//         carouselInstance.current = new Carousel(carouselRef.current, {
//           interval: 2000,
//         });
//       } catch (error) {
//         console.error("Carousel initialization error:", error);
//       }
//     }
//     return () => {
//       if (carouselInstance.current) {
//         carouselInstance.current.dispose();
//       }
//     };
//   }, []);

//   useEffect(() => {
//     if (ytLink === "404") {
//       setLen(imgLinks.length);
//     } else {
//       setLen(imgLinks.length + 1);
//     }
//   }, [ytLink, imgLinks]);

//   const handleNext = () => {
//     if (carouselInstance.current) {
//       carouselInstance.current.next();
//     }
//   };

//   const handlePrev = () => {
//     if (carouselInstance.current) {
//       carouselInstance.current.prev();
//     }
//   };

//   const hasSlides =
//     (imgLinks && imgLinks.length > 0) || (ytLink && ytLink !== "404");

//   return (
//     <section
//       className={`self-stretch flex flex-row items-start justify-center pt-0 pb-0 pr-5 pl-[21px] box-border max-w-full mq750:box-border`}
//     >
//       <div className="w-[1199px] flex flex-col items-start justify-start gap-[39px] max-w-full mq750:gap-[19px]">
//         <div className="w-[255px] flex flex-row items-start justify-start gap-[23px]"></div>
//         <div className="self-stretch rounded-xl bg-orange flex flex-row items-start justify-start relative max-w-full">
//           <div
//             className="carousel slide w-full h-[460px] relative"
//             ref={carouselRef}
//             id="carouselExampleControls"
//             data-bs-ride="carousel"
//             data-bs-interval="7000"
//           >
//             <div
//               className="carousel-inner relative w-full overflow-hidden"
//               style={{ scrollBehavior: "smooth" }}
//             >
//               {/* Render image slides first. The very first image is marked as active */}
//               {imgLinks &&
//                 imgLinks.map((imgLink, index) => (
//                   <div
//                     key={index}
//                     className={`carousel-item ${
//                       index === 0 && (!ytLink || ytLink === "404")
//                         ? "active"
//                         : ""
//                     } w-full h-[460px] relative rounded-xl overflow-hidden`}
//                   >
//                     <img
//                       src={imgLink}
//                       alt="EventPoster"
//                       className="h-[460px] w-full relative rounded-xl max-w-full overflow-hidden"
//                       onError={(e) => {
//                         e.target.onerror = null;
//                         e.target.src =
//                           "https://via.placeholder.com/1199x460?text=Image+Not+Available";
//                         console.error("Error loading image:", imgLink);
//                       }}
//                     />
//                   </div>
//                 ))}

//               {/* Render YouTube slide as the last slide if available.
//                   If there are no images, mark the YouTube slide as active */}
//               {ytLink && ytLink !== "404" && (
//                 <div
//                   className={`carousel-item ${
//                     imgLinks.length === 0 ? "active" : ""
//                   } w-full h-[460px] relative`}
//                 >
//                   <iframe
//                     className="h-[460px] w-full relative rounded-xl max-w-full overflow-hidden"
//                     src={`https://www.youtube.com/embed/${ytLink}`}
//                     title="Live Satsang Event"
//                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
//                     referrerPolicy="strict-origin-when-cross-origin"
//                     allowFullScreen
//                     onError={(e) => {
//                       console.error("Error loading YouTube video:", ytLink);
//                     }}
//                   />
//                 </div>
//               )}
//             </div>
//             {hasSlides && (
//               <>
//                 <button
//                   className="carousel-prev absolute top-0 left-0 z-30 flex items-center justify-center w-10 h-10 text-white cursor-pointer"
//                   style={{
//                     borderTopLeftRadius: "1rem",
//                     backgroundColor: "rgba(0,0,0,0.4)",
//                   }}
//                   onClick={handlePrev}
//                 >
//                   <svg
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       d="M15 19l-7-7 7-7"
//                     />
//                   </svg>
//                 </button>
//                 <button
//                   className="carousel-next absolute top-0 right-0 z-30 flex items-center justify-center w-10 h-10 text-white cursor-pointer"
//                   style={{
//                     borderTopRightRadius: "1rem",
//                     backgroundColor: "rgba(0,0,0,0.4)",
//                   }}
//                   onClick={handleNext}
//                 >
//                   <svg
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       d="M9 5l7 7-7 7"
//                     />
//                   </svg>
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// imageCarousel.propTypes = {
//   className: PropTypes.string,
// };

// export default imageCarousel;
