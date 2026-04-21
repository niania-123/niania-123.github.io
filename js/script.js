/**
 * my_portfolio/js/script.js
 *
 * 功能：
 *  1. 页面加载淡入
 *  2. 点击项目卡片 → 控制台输出项目标题
 *  3. 移动端汉堡菜单折叠 / 展开
 *  4. 滚动淡入动画（IntersectionObserver）
 */

'use strict';

/* ================================================================
   1. 页面加载淡入
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // 先给 body 加上 hidden，页面渲染完后淡入
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity .6s ease';

  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });
});

/* ================================================================
   2. 点击项目卡片 → 控制台输出标题
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const projectCards = document.querySelectorAll('.project-card');

  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const title = card.querySelector('.project-title');
      if (title) {
        console.log('🗂 项目：', title.textContent.trim());
      }
    });
  });
});

/* ================================================================
   3. 移动端汉堡菜单
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const toggle  = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (!toggle || !navLinks) return;

  // 点击按钮切换展开 / 折叠
  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    // 汉堡 → X 动画
    const spans = toggle.querySelectorAll('span');
    const isOpen = navLinks.classList.contains('open');
    if (isOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // 点击任意导航链接后关闭菜单
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      const spans = toggle.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    });
  });
});

/* ================================================================
   4. 滚动淡入动画（IntersectionObserver）
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const fadeEls = document.querySelectorAll('.fade-in');

  if (!fadeEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // 触发一次后不再监听
        }
      });
    },
    { threshold: 0.10 }
  );

  fadeEls.forEach(el => observer.observe(el));
});
