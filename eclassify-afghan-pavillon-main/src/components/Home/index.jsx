"use client";
import React, { useEffect, useState, useCallback } from "react";
import { FeaturedSectionApi, sliderApi } from "@/utils/api";
import { useDispatch, useSelector } from "react-redux";
import { SliderData, setSlider } from "@/redux/reuducer/sliderSlice";
import { CurrentLanguageData } from "@/redux/reuducer/languageSlice";
import { settingsData } from "@/redux/reuducer/settingSlice";
import FeaturedSectionsSkeleton from "../Skeleton/FeaturedSectionsSkeleton";
import SliderSkeleton from "../Skeleton/Sliderskeleton";
import OfferSlider from "./OfferSlider";
import PopularCategories from "./PopularCategories";
import FeaturedSections from "./FeaturedSections";
import HomeAllItem from "./HomeAllItem";
import { getKilometerRange } from "@/redux/reuducer/locationSlice";
import withRedirect from "../Layout/withRedirect";
import { ErrorBoundary } from "react-error-boundary";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="container py-5 text-center">
    <h2 className="text-danger mb-3">Something went wrong</h2>
    <p className="text-muted mb-4">{error.message}</p>
    <button 
      onClick={resetErrorBoundary}
      className="btn btn-primary"
    >
      Try again
    </button>
  </div>
);

const HomePage = ({ categories, products, featuredItems }) => {
  const dispatch = useDispatch();
  const slider = useSelector(SliderData);
  const KmRange = useSelector(getKilometerRange);
  const [isLoading, setIsLoading] = useState(false);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(false);
  const currentLanguage = useSelector(CurrentLanguageData);
  const [featuredData, setFeaturedData] = useState([]);
  const systemSettingsData = useSelector(settingsData);
  const settings = systemSettingsData?.data;
  const isDemoMode = settings?.demo_mode;
  const cityData = useSelector((state) => state?.Location?.cityData);

  const fetchSliderData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await sliderApi.getSlider();
      const data = response.data;
      dispatch(setSlider(data.data));
    } catch (error) {
      console.error("Error fetching slider:", error);
      toast.error("Failed to load slider data");
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  const fetchFeaturedSectionData = useCallback(async () => {
    setIsFeaturedLoading(true);
    try {
      const params = {};
      if (!isDemoMode) {
        if (KmRange > 0) {
          params.radius = KmRange;
          params.latitude = cityData.lat;
          params.longitude = cityData.long;
        } else {
          if (cityData?.city) {
            params.city = cityData.city;
          } else if (cityData?.state) {
            params.state = cityData.state;
          } else if (cityData?.country) {
            params.country = cityData.country;
          }
        }
      }
      const response = await FeaturedSectionApi.getFeaturedSections(params);
      const { data } = response.data;
      setFeaturedData(data);
    } catch (error) {
      console.error("Error fetching featured sections:", error);
      toast.error("Failed to load featured sections");
    } finally {
      setIsFeaturedLoading(false);
    }
  }, [cityData, currentLanguage, KmRange, isDemoMode]);

  useEffect(() => {
    fetchSliderData();
  }, [fetchSliderData]);

  useEffect(() => {
    fetchFeaturedSectionData();
  }, [fetchFeaturedSectionData]);

  const allEmpty = featuredData?.every((ele) => ele?.section_data.length === 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="home-container"
      >
        <motion.div variants={itemVariants}>
          {isLoading ? <SliderSkeleton /> : <OfferSlider sliderData={slider} />}
        </motion.div>

        <motion.div variants={itemVariants}>
          <PopularCategories categories={categories} />
        </motion.div>

        <motion.div variants={itemVariants}>
          {isFeaturedLoading ? (
            <FeaturedSectionsSkeleton />
          ) : (
            <FeaturedSections
              featuredData={featuredData}
              setFeaturedData={setFeaturedData}
              cityData={cityData}
              allEmpty={allEmpty}
            />
          )}
        </motion.div>

        <motion.div variants={itemVariants}>
          <HomeAllItem 
            cityData={cityData} 
            allEmpty={allEmpty}
            products={products}
          />
        </motion.div>
      </motion.div>
    </ErrorBoundary>
  );
};

export default withRedirect(HomePage);
