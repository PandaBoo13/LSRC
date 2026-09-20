// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-33.333%)' },
        },
      },
      animation: {
        marquee: 'marquee 35s linear infinite',
      },
    },
  },
};