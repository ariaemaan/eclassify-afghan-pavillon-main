'use client'
import React, { memo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FaShoppingBag } from 'react-icons/fa'

const PopularCategory = memo(({ category }) => {
    const { name, slug, icon, productCount = 0 } = category || {}
    const [imageError, setImageError] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const handleImageLoad = () => {
        setIsLoading(false)
    }

    const handleImageError = () => {
        setImageError(true)
        setIsLoading(false)
    }

    if (!category) return null

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="popular-category-card group"
        >
            <Link 
                href={`/category/${slug || '#'}`}
                className="flex flex-col items-center justify-center p-6 text-center transition-all duration-300 hover:bg-primary/5 rounded-xl"
                aria-label={`Browse ${name || 'Category'} category`}
            >
                <div className="relative mb-4 p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        </div>
                    )}
                    {!imageError && icon ? (
                        <Image 
                            src={icon} 
                            alt={`${name || 'Category'} icon`}
                            width={32}
                            height={32}
                            className={`w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-110 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                            priority={false}
                            unoptimized={process.env.NODE_ENV === 'development'}
                        />
                    ) : (
                        <FaShoppingBag className="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-110" />
                    )}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800 group-hover:text-primary transition-colors">
                    {name || 'Category'}
                </h3>
                <p className="text-sm text-gray-600 group-hover:text-primary/80 transition-colors">
                    {productCount} {productCount === 1 ? 'Product' : 'Products'}
                </p>
            </Link>
        </motion.div>
    )
})

PopularCategory.displayName = 'PopularCategory'

export default PopularCategory