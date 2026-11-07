/* ============================================================
   PIZZARIA SABORES ITALIANO - sprite de icones (fonte unica)
   Todos os <symbol> usados por <use href="#id"> nas paginas.
   Carregado antes do base.js e injetado uma unica vez no body,
   entao nenhum HTML precisa mais embutir o sprite.
   ============================================================ */
(function () {
  'use strict';

  var SPRITE =
'<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">\n' +
'    <symbol id="alert" viewBox="0 0 24 24">\n' +
'    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>\n' +
'    <line x1="12" y1="9" x2="12" y2="13"/>\n' +
'    <line x1="12" y1="17" x2="12.01" y2="17"/>\n' +
'  </symbol>\n' +
'    <symbol id="arrow-right" viewBox="0 0 24 24">\n' +
'    <line x1="3" y1="12" x2="20" y2="12"/>\n' +
'    <polyline points="14 6 20 12 14 18"/>\n' +
'  </symbol>\n' +
'    <symbol id="award" viewBox="0 0 24 24">\n' +
'    <circle cx="12" cy="8" r="7"/>\n' +
'    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>\n' +
'  </symbol>\n' +
'    <symbol id="box" viewBox="0 0 24 24">\n' +
'    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>\n' +
'    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>\n' +
'    <line x1="12" y1="22.08" x2="12" y2="12"/>\n' +
'  </symbol>\n' +
'    <symbol id="calendar" viewBox="0 0 24 24">\n' +
'    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>\n' +
'    <line x1="16" y1="2" x2="16" y2="6"/>\n' +
'    <line x1="8" y1="2" x2="8" y2="6"/>\n' +
'    <line x1="3" y1="10" x2="21" y2="10"/>\n' +
'  </symbol>\n' +
'    <symbol id="card" viewBox="0 0 24 24">\n' +
'    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>\n' +
'    <line x1="1" y1="10" x2="23" y2="10"/>\n' +
'  </symbol>\n' +
'    <symbol id="cart" viewBox="0 0 24 24">\n' +
'    <circle cx="9" cy="21" r="1"/>\n' +
'    <circle cx="20" cy="21" r="1"/>\n' +
'    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>\n' +
'  </symbol>\n' +
'    <symbol id="chart" viewBox="0 0 24 24">\n' +
'    <line x1="18" y1="20" x2="18" y2="10"/>\n' +
'    <line x1="12" y1="20" x2="12" y2="4"/>\n' +
'    <line x1="6" y1="20" x2="6" y2="14"/>\n' +
'  </symbol>\n' +
'    <symbol id="check" viewBox="0 0 24 24">\n' +
'    <polyline points="20 6 9 17 4 12"/>\n' +
'  </symbol>\n' +
'    <symbol id="chef" viewBox="0 0 24 24">\n' +
'    <path d="M6 19a3 3 0 0 1-3-3 4 4 0 0 1 2.5-3.7A5 5 0 0 1 12 5a5 5 0 0 1 6.5 7.3A4 4 0 0 1 21 16a3 3 0 0 1-3 3z"/>\n' +
'    <line x1="7" y1="19" x2="17" y2="19"/>\n' +
'  </symbol>\n' +
'    <symbol id="chevron-down" viewBox="0 0 24 24">\n' +
'    <polyline points="6 9 12 15 18 9"/>\n' +
'  </symbol>\n' +
'    <symbol id="chevron-right" viewBox="0 0 24 24">\n' +
'    <polyline points="9 18 15 12 9 6"/>\n' +
'  </symbol>\n' +
'    <symbol id="chevron-left" viewBox="0 0 24 24">\n' +
'    <polyline points="15 18 9 12 15 6"/>\n' +
'  </symbol>\n' +
'    <symbol id="clipboard" viewBox="0 0 24 24">\n' +
'    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>\n' +
'    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>\n' +
'  </symbol>\n' +
'    <symbol id="clock" viewBox="0 0 24 24">\n' +
'    <circle cx="12" cy="12" r="10"/>\n' +
'    <polyline points="12 6 12 12 16 14"/>\n' +
'  </symbol>\n' +
'    <symbol id="dollar" viewBox="0 0 24 24">\n' +
'    <line x1="12" y1="1" x2="12" y2="23"/>\n' +
'    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>\n' +
'  </symbol>\n' +
'    <symbol id="download" viewBox="0 0 24 24">\n' +
'    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>\n' +
'    <polyline points="7 10 12 15 17 10"/>\n' +
'    <line x1="12" y1="15" x2="12" y2="3"/>\n' +
'  </symbol>\n' +
'    <symbol id="drink" viewBox="0 0 24 24">\n' +
'    <path d="M9 2h6v3.5l-1 2.5v11a3 3 0 0 1-4 0V8l-1-2.5z"/>\n' +
'    <line x1="8" y1="13" x2="16" y2="13"/>\n' +
'  </symbol>\n' +
'    <symbol id="edit" viewBox="0 0 24 24">\n' +
'    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>\n' +
'  </symbol>\n' +
'    <symbol id="eye" viewBox="0 0 24 24">\n' +
'    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>\n' +
'    <circle cx="12" cy="12" r="3"/>\n' +
'  </symbol>\n' +
'    <symbol id="eye-off" viewBox="0 0 24 24">\n' +
'    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>\n' +
'    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>\n' +
'    <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88"/>\n' +
'    <line x1="1" y1="1" x2="23" y2="23"/>\n' +
'  </symbol>\n' +
'    <symbol id="flag" viewBox="0 0 24 24">\n' +
'    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>\n' +
'    <line x1="4" y1="22" x2="4" y2="15"/>\n' +
'  </symbol>\n' +
'    <symbol id="heart" viewBox="0 0 24 24">\n' +
'    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>\n' +
'  </symbol>\n' +
'    <symbol id="history" viewBox="0 0 24 24">\n' +
'    <path d="M3.05 11a9 9 0 1 1 .5 4"/>\n' +
'    <polyline points="3 4 3 11 10 11"/>\n' +
'    <polyline points="12 7.5 12 12.5 15.5 14.5"/>\n' +
'  </symbol>\n' +
'    <symbol id="home" viewBox="0 0 24 24">\n' +
'    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>\n' +
'    <polyline points="9 22 9 12 15 12 15 22"/>\n' +
'  </symbol>\n' +
'    <symbol id="i-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16M14 6l6 6-6 6"/></symbol>\n' +
'    <symbol id="i-award" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5"/></symbol>\n' +
'    <symbol id="i-bag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l1 13a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20L6 7Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></symbol>\n' +
'    <symbol id="i-calendar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="17" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/></symbol>\n' +
'    <symbol id="i-cart" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h2.2l2.3 12.1a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L21 7H5.4"/></symbol>\n' +
'    <symbol id="i-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></symbol>\n' +
'    <symbol id="i-chef" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 20h12M6 17h12v-4a4 4 0 0 0 1.9-7.6A4 4 0 0 0 12 3a4 4 0 0 0-3.9 2.4A4 4 0 0 0 6 13v4Z"/></symbol>\n' +
'    <symbol id="i-chevron-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></symbol>\n' +
'    <symbol id="i-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></symbol>\n' +
'    <symbol id="i-dollar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 6.5c0-2-2.2-3-5-3s-5 1-5 3.2c0 4.8 10 2.6 10 7.4 0 2.3-2.2 3.4-5 3.4s-5-1.2-5-3.2"/></symbol>\n' +
'    <symbol id="i-facebook" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 8.5V7a2 2 0 0 1 2-2h1.5"/><path d="M14 11h3M9 21v-9a4 4 0 0 1 4-4h1"/><rect x="3" y="3" width="18" height="18" rx="5"/></symbol>\n' +
'    <symbol id="i-heart" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8Z"/></symbol>\n' +
'    <symbol id="i-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.6v.4"/></symbol>\n' +
'    <symbol id="i-instagram" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5v.01"/></symbol>\n' +
'    <symbol id="i-mail" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></symbol>\n' +
'    <symbol id="i-phone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/></symbol>\n' +
'    <symbol id="i-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></symbol>\n' +
'    <symbol id="i-pizza" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 11h.01M11 15h.01M16 16h.01M2 16.5 21.5 3a18 18 0 0 1-13.5 19.5A18 18 0 0 1 2 16.5Z"/><circle cx="13" cy="9.5" r="1" fill="currentColor" stroke="none"/><circle cx="9" cy="14.5" r="1" fill="currentColor" stroke="none"/></symbol>\n' +
'    <symbol id="i-scooter" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="2.5"/><circle cx="18.5" cy="17.5" r="2.5"/><path d="M8 17.5h8M15 5h3l1.5 6M14 9h3.5"/><path d="M8 17.5 10.5 8H6"/></symbol>\n' +
'    <symbol id="i-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-3.5 8-10V5.5L12 2 4 5.5V12c0 6.5 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></symbol>\n' +
'    <symbol id="i-star" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></symbol>\n' +
'    <symbol id="i-store" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5 4.5 4h15L21 9.5M4 9.5v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-10M4 9.5a2.5 2.5 0 0 0 4 0 2.5 2.5 0 0 0 4 0 2.5 2.5 0 0 0 4 0 2.5 2.5 0 0 0 4 0"/></symbol>\n' +
'    <symbol id="i-tag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.6 13.4 11 3.8V3H4v7h.8l9.6 9.6a2 2 0 0 0 2.8 0l3.4-3.4a2 2 0 0 0 0-2.8Z"/><circle cx="7.5" cy="7.5" r="1.3" fill="currentColor" stroke="none"/></symbol>\n' +
'    <symbol id="i-truck" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 17V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h2"/><path d="M14 9h4l4 4v4a2 2 0 0 1-2 2h-1"/><circle cx="7" cy="17.5" r="2"/><circle cx="17.5" cy="17.5" r="2"/></symbol>\n' +
'    <symbol id="i-user" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></symbol>\n' +
'    <symbol id="i-whatsapp" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.2-5.2A8.5 8.5 0 1 1 21 11.5Z"/><path d="M8.8 9c.4 2.6 2.6 4.8 5.2 5.2l1-1.4 1.7.7-.4 1.4c-3.8.6-8-3.5-7.4-7.4l1.4-.4.7 1.7-1 1"/></symbol>\n' +
'    <symbol id="info" viewBox="0 0 24 24">\n' +
'    <circle cx="12" cy="12" r="10"/>\n' +
'    <line x1="12" y1="16" x2="12" y2="12"/>\n' +
'    <line x1="12" y1="8" x2="12.01" y2="8"/>\n' +
'  </symbol>\n' +
'    <symbol id="lock" viewBox="0 0 24 24">\n' +
'    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>\n' +
'    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>\n' +
'  </symbol>\n' +
'    <symbol id="logout" viewBox="0 0 24 24">\n' +
'    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>\n' +
'    <polyline points="16 17 21 12 16 7"/>\n' +
'    <line x1="21" y1="12" x2="9" y2="12"/>\n' +
'  </symbol>\n' +
'    <symbol id="mail" viewBox="0 0 24 24">\n' +
'    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>\n' +
'    <polyline points="22,6 12,13 2,6"/>\n' +
'  </symbol>\n' +
'    <symbol id="menu" viewBox="0 0 24 24">\n' +
'    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>\n' +
'    <path d="M7 2v20"/>\n' +
'    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>\n' +
'  </symbol>\n' +
'    <symbol id="minus" viewBox="0 0 24 24">\n' +
'    <line x1="5" y1="12" x2="19" y2="12"/>\n' +
'  </symbol>\n' +
'    <symbol id="phone" viewBox="0 0 24 24">\n' +
'    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>\n' +
'  </symbol>\n' +
'    <symbol id="pin" viewBox="0 0 24 24">\n' +
'    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>\n' +
'    <circle cx="12" cy="10" r="3"/>\n' +
'  </symbol>\n' +
'    <symbol id="pix" viewBox="0 0 24 24">\n' +
'    <rect x="3" y="3" width="8" height="8" rx="1"/>\n' +
'    <rect x="13" y="3" width="8" height="8" rx="1"/>\n' +
'    <rect x="3" y="13" width="8" height="8" rx="1"/>\n' +
'    <path d="M13 13h3v3h-3z"/>\n' +
'    <path d="M20 18h1v1h-1z"/>\n' +
'  </symbol>\n' +
'    <symbol id="pizza" viewBox="0 0 24 24">\n' +
'    <path fill="currentColor" fill-rule="evenodd" d="M4 3.5a16.5 16.5 0 0 1 16.5 16.5H4zM9.3 10.3a1.3 1.3 0 1 0 .1 2.6 1.3 1.3 0 0 0-.1-2.6zm3.5 3.4a1.2 1.2 0 1 0 .1 2.4 1.2 1.2 0 0 0-.1-2.4zm-5.3 1.3a1.1 1.1 0 1 0 .1 2.2 1.1 1.1 0 0 0-.1-2.2z"/>\n' +
'  </symbol>\n' +
'    <symbol id="pizza" viewBox="0 0 24 24">\n' +
'    <path d="M4 6.2Q12 2 20 6.2L12 20.8Z"/>\n' +
'    <circle cx="9.4" cy="8.4" r="1"/>\n' +
'    <circle cx="14.4" cy="8.4" r="1"/>\n' +
'    <circle cx="11.9" cy="13" r="1"/>\n' +
'  </symbol>\n' +
'    <symbol id="plus" viewBox="0 0 24 24">\n' +
'    <line x1="12" y1="5" x2="12" y2="19"/>\n' +
'    <line x1="5" y1="12" x2="19" y2="12"/>\n' +
'  </symbol>\n' +
'    <symbol id="refresh" viewBox="0 0 24 24">\n' +
'    <polyline points="23 4 23 10 17 10"/>\n' +
'    <polyline points="1 20 1 14 7 14"/>\n' +
'    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>\n' +
'  </symbol>\n' +
'    <symbol id="save" viewBox="0 0 24 24">\n' +
'    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>\n' +
'    <polyline points="17 21 17 13 7 13 7 21"/>\n' +
'    <polyline points="7 3 7 8 15 8"/>\n' +
'  </symbol>\n' +
'    <symbol id="scooter" viewBox="0 0 24 24">\n' +
'    <circle cx="5.5" cy="17.5" r="3"/>\n' +
'    <circle cx="18.5" cy="17.5" r="3"/>\n' +
'    <path d="M8.5 17.5h7"/>\n' +
'    <path d="M5.5 14.5l3-6h5l3.5 6"/>\n' +
'    <path d="M16.5 8.5h3l1.5 6"/>\n' +
'  </symbol>\n' +
'    <symbol id="search" viewBox="0 0 24 24">\n' +
'    <circle cx="11" cy="11" r="8"/>\n' +
'    <line x1="21" y1="21" x2="16.65" y2="16.65"/>\n' +
'  </symbol>\n' +
'    <symbol id="settings" viewBox="0 0 24 24">\n' +
'    <line x1="4" y1="21" x2="4" y2="14"/>\n' +
'    <line x1="4" y1="10" x2="4" y2="3"/>\n' +
'    <line x1="12" y1="21" x2="12" y2="12"/>\n' +
'    <line x1="12" y1="8" x2="12" y2="3"/>\n' +
'    <line x1="20" y1="21" x2="20" y2="16"/>\n' +
'    <line x1="20" y1="12" x2="20" y2="3"/>\n' +
'    <line x1="1" y1="14" x2="7" y2="14"/>\n' +
'    <line x1="9" y1="8" x2="15" y2="8"/>\n' +
'    <line x1="17" y1="16" x2="23" y2="16"/>\n' +
'  </symbol>\n' +
'    <symbol id="shield" viewBox="0 0 24 24">\n' +
'    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>\n' +
'    <polyline points="8.6 12.2 11 14.6 15.4 9.8"/>\n' +
'  </symbol>\n' +
'    <symbol id="star" viewBox="0 0 24 24">\n' +
'    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>\n' +
'  </symbol>\n' +
'    <symbol id="store" viewBox="0 0 24 24">\n' +
'    <path d="M3 9l1.5-5h15L21 9v1a3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1-3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3V9z"/>\n' +
'    <path d="M6 14v7h12v-7"/>\n' +
'  </symbol>\n' +
'    <symbol id="tag" viewBox="0 0 24 24">\n' +
'    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>\n' +
'    <line x1="7" y1="7" x2="7.01" y2="7"/>\n' +
'  </symbol>\n' +
'    <symbol id="trash" viewBox="0 0 24 24">\n' +
'    <polyline points="3 6 5 6 21 6"/>\n' +
'    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>\n' +
'  </symbol>\n' +
'    <symbol id="trend" viewBox="0 0 24 24">\n' +
'    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>\n' +
'    <polyline points="17 6 23 6 23 12"/>\n' +
'  </symbol>\n' +
'    <symbol id="truck" viewBox="0 0 24 24">\n' +
'    <rect x="1" y="3" width="15" height="13" rx="1"/>\n' +
'    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>\n' +
'    <circle cx="5.5" cy="18.5" r="2.5"/>\n' +
'    <circle cx="18.5" cy="18.5" r="2.5"/>\n' +
'  </symbol>\n' +
'    <symbol id="user" viewBox="0 0 24 24">\n' +
'    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>\n' +
'    <circle cx="12" cy="7" r="4"/>\n' +
'  </symbol>\n' +
'    <symbol id="users" viewBox="0 0 24 24">\n' +
'    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>\n' +
'    <circle cx="9" cy="7" r="4"/>\n' +
'    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>\n' +
'    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>\n' +
'  </symbol>\n' +
'    <symbol id="x" viewBox="0 0 24 24">\n' +
'    <line x1="18" y1="6" x2="6" y2="18"/>\n' +
'    <line x1="6" y1="6" x2="18" y2="18"/>\n' +
'  </symbol>\n' +
'  </svg>';

  function inject() {
    if (document.getElementById('icon-sprite')) return;
    var box = document.createElement('div');
    box.id = 'icon-sprite';
    box.style.display = 'none';
    box.innerHTML = SPRITE;
    document.body.insertBefore(box, document.body.firstChild);
  }

  if (document.body) inject();
  else document.addEventListener('DOMContentLoaded', inject);
})();
