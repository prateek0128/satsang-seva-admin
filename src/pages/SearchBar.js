import SearchAndFilters from "../components/SearchAndFilters";
import FirstFold1 from "../components/FirstFold1";
import Footer from "../components/Footer";

const SearchBar = () => {
  return (
    <div
      style={{ marginTop: "-5rem" }}
      className="w-full relative bg-white overflow-hidden flex flex-col items-end justify-start py-0 px-px box-border leading-[normal] tracking-[normal] mq750:gap-[18px]"
    >
      <FirstFold1 />
      <SearchAndFilters />
      <Footer />
    </div>
  );
};

export default SearchBar;
