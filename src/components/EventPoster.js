import { Button } from "@mui/material";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const EventPoster = ({ className = "", poster }) => {
  const navigate = useNavigate();
  return (
    <form
      className={`m-0 self-stretch flex flex-col items-start justify-start gap-[44px] max-w-full mq750:gap-[22px] ${className}`}
    >
      <div className="self-stretch h-[532px] relative">
        {/* Background Image */}
        <img
          className="absolute top-[50px] left-0 h-[460px] w-full object-cover rounded-xl max-w-full"
          alt="Curvy Background"
          src={poster}
          style={{ zIndex: 0 }} // Ensure image is behind other elements
        />
        {/* Buttons */}
        <Button
          className="absolute top-[0px] left-[0px]"
          disableElevation
          variant="outlined"
          sx={{
            textTransform: "none",
            color: "#d26600",
            fontSize: "14",
            borderColor: "#d26600",
            borderRadius: "50px",
            "&:hover": { borderColor: "#d26600" },
            width: 114,
            height: 33,
          }}
          onClick={() => navigate("/")}
        >
          Home
        </Button>
        <Button
          className="absolute top-[0px] left-[137px]"
          disableElevation
          variant="contained"
          sx={{
            textTransform: "none",
            color: "#fff",
            fontSize: "14",
            background: "#d26600",
            border: "#f5f5f5 solid 1px",
            borderRadius: "50px",
            "&:hover": { background: "#d26600" },
            width: 118,
            height: 33,
          }}
          onClick={() => navigate("/#upcomingEvents")}
        >
          Events
        </Button>
      </div>
    </form>
  );
};

EventPoster.propTypes = {
  className: PropTypes.string,
  poster: PropTypes.string,
};

export default EventPoster;
