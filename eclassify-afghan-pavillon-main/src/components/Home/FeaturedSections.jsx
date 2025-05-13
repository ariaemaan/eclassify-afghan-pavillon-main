'use client';
import React, { memo, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiArrowRightLine } from 'react-icons/ri';
import Link from 'next/link';
import Image from 'next/image';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { t } from "@/utils";
import { userSignUpData } from "@/redux/reuducer/authSlice";
import { useSelector } from "react-redux";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 20
        }
    },
    exit: {
        opacity: 0,
        scale: 0.9,
        transition: {
            duration: 0.2
        }
    }
};

const FeaturedSections = memo(({ sections = [], setFeaturedData, allEmpty }) => {
    const userData = useSelector(userSignUpData);
    const [likedItems, setLikedItems] = useState(new Set());
    const [loadingStates, setLoadingStates] = useState({});

    const handleLike = useCallback(async (itemId) => {
        if (!itemId) return;
        
        try {
            setLoadingStates(prev => ({ ...prev, [itemId]: true }));
            
            // Implement like functionality here
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulated API call
            
            setLikedItems(prev => {
                const newSet = new Set(prev);
                if (newSet.has(itemId)) {
                    newSet.delete(itemId);
                    toast.success(t('itemUnliked'));
                } else {
                    newSet.add(itemId);
                    toast.success(t('itemLiked'));
                }
                return newSet;
            });
        } catch (error) {
            console.error('Like error:', error);
            toast.error(t('likeError'));
        } finally {
            setLoadingStates(prev => ({ ...prev, [itemId]: false }));
        }
    }, [t]);

    if (!sections?.length || allEmpty) {
        return null;
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {sections.map((section) => (
                <motion.section
                    key={section.id || section.title}
                    variants={sectionVariants}
                    className="bg-white rounded-xl shadow-sm p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                        {section.viewAllLink && (
                            <Link
                                href={section.viewAllLink}
                                className="flex items-center text-primary hover:text-primary-dark transition-colors"
                            >
                                {t('viewAll')}
                                <RiArrowRightLine className="ml-1" />
                            </Link>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {section.items?.map((item) => (
                                <motion.div
                                    key={item.id || item.name}
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    whileHover={{ scale: 1.02 }}
                                    className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <Link href={item.link || '#'} className="block">
                                        <div className="relative aspect-square">
                                            <Image
                                                src={item.image || '/placeholder.png'}
                                                alt={item.name || 'Product'}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                loading="lazy"
                                                unoptimized={process.env.NODE_ENV === 'development'}
                                            />
                                            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                                                {item.name || 'Product'}
                                            </h3>
                                            <p className="text-primary font-medium">
                                                {typeof item.price === 'number' 
                                                    ? item.price.toLocaleString('en-US', {
                                                        style: 'currency',
                                                        currency: 'USD'
                                                    })
                                                    : 'Price not available'
                                                }
                                            </p>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={() => handleLike(item.id)}
                                        disabled={loadingStates[item.id]}
                                        className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label={likedItems.has(item.id) ? t('unlikeItem') : t('likeItem')}
                                    >
                                        {loadingStates[item.id] ? (
                                            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                        ) : likedItems.has(item.id) ? (
                                            <FaHeart className="text-red-500" />
                                        ) : (
                                            <FaRegHeart className="text-gray-600" />
                                        )}
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </motion.section>
            ))}
        </motion.div>
    );
});

FeaturedSections.displayName = 'FeaturedSections';

export default FeaturedSections;
