const { description } = require('../package')

module.exports = {
  lang: 'ru-RU',
  title: 'Нектар преданности',
  description: description,

  /**
   * Extra tags to be injected to the page HTML `<head>`
   *
   * ref：https://v1.vuepress.vuejs.org/config/#head
   */
  head: [
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    [
      'meta',
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black' },
    ],
  ],

  /**
   * Theme configuration, here is the default theme configuration for VuePress.
   *
   * ref：https://v1.vuepress.vuejs.org/theme/default-theme-config.html
   */
  themeConfig: {
    repo: 'vedmalex/NODRUS',
    docsBranch: 'main',
    docsDir: './',
    editLinks: true,
    editLinkText: 'Нашли ошибку? Редактировать...',
    lastUpdated: 'Обновление',
    searchPlaceholder: 'Найти...',
    displayAllHeaders: true,
    nav: [
      {
        text: 'Шлоки',
        link: '/slokas/index.md',
      },
      {
        text: 'Саманьйа бхакти',
        link: '/1000/index.md',
      },
      {
        text: 'Восточная часть',
        link: '/1000/index.md',
      },
      {
        text: 'Южная часть',
        link: '/2000/index.md',
      },
      {
        text: 'Западная часть',
        link: '/3000/index.md',
      },
      {
        text: 'Северная часть',
        link: '/4000/index.md',
      },
    ],
    // sidebar: 'auto',
    sidebar: {
      '/': [
        {
          title: 'Модуль 1',
          children: [
            { title: 'Занятие 1', path: '/lessons/1' },
            { title: 'Занятие 2', path: '/lessons/2' },
            { title: 'Занятие 3', path: '/lessons/3' },
            { title: 'Занятие 4', path: '/lessons/4' },
            { title: 'Занятие 5', path: '/lessons/5' },
            { title: 'Занятие 6', path: '/lessons/6' },
            { title: 'Занятие 7', path: '/lessons/7' },
          ],
        },
        {
          title: 'Модуль 2',
          children: [
            { title: 'Занятие 8', path: '/lessons/8' },
            { title: 'Занятие 9', path: '/lessons/9' },
            { title: 'Занятие 10', path: '/lessons/10' },
            { title: 'Занятие 11', path: '/lessons/11' },
            { title: 'Занятие 12', path: '/lessons/12' },
            { title: 'Занятие 13', path: '/lessons/13' },
            { title: 'Занятие 14', path: '/lessons/14' },
          ],
        },
        {
          title: 'Вопросы по главам',
          children: [
            { title: 'Занятие 1', path: '/quest_by_chapter/b-010.md' },
            { title: 'Занятие 2', path: '/quest_by_chapter/b-020.md' },
            { title: 'Занятие 3', path: '/quest_by_chapter/b-030.md' },
            { title: 'Занятие 4', path: '/quest_by_chapter/b-040.md' },
            { title: 'Занятие 5', path: '/quest_by_chapter/b-050.md' },
            { title: 'Занятие 6', path: '/quest_by_chapter/b-060.md' },
            { title: 'Занятие 7', path: '/quest_by_chapter/b-070.md' },
            { title: 'Занятие 8', path: '/quest_by_chapter/b-080.md' },
            { title: 'Занятие 9', path: '/quest_by_chapter/b-090.md' },
            { title: 'Занятие 10', path: '/quest_by_chapter/b-100.md' },
            { title: 'Занятие 11', path: '/quest_by_chapter/b-110.md' },
            { title: 'Занятие 12', path: '/quest_by_chapter/b-120.md' },
            { title: 'Занятие 13', path: '/quest_by_chapter/b-130.md' },
            { title: 'Занятие 14', path: '/quest_by_chapter/b-140.md' },
            { title: 'Занятие 15', path: '/quest_by_chapter/b-150.md' },
            { title: 'Занятие 16', path: '/quest_by_chapter/b-160.md' },
            { title: 'Занятие 17', path: '/quest_by_chapter/b-170.md' },
            { title: 'Занятие 18', path: '/quest_by_chapter/b-180.md' },
            { title: 'Занятие 19', path: '/quest_by_chapter/b-190.md' },
          ],
        },
        {
          title: 'Шлоки',
          path: '/slokas/index',
          children: [
            {
              title: 'БРС 1.2.101: ш́рути-смр̣ти-пура̄н̣а̄ди',
              path: '/slokas/brs_1_2_101.md',
            },
            {
              title: 'БРС 1.1.11 анйа̄бхила̄шита̄-ш́ӯнйам̇',
              path: '/slokas/brs_1_1_11.md',
            },
            {
              title: 'БРС 1.2.8: смартавйах̣ сататам̇ вишн̣ур',
              path: '/slokas/brs_1_2_8.md',
            },
            {
              title: 'БРС 1.2.2: кр̣ти-са̄дхйа̄ бхавет са̄дхйа',
              path: '/slokas/brs_1_2_2.md',
            },
            {
              title: 'БРС 1.2.6: йатра ра̄га̄н ава̄птатва̄т',
              path: '/slokas/brs_1_2_6.md',
            },
            {
              title: 'БРС 1.2.234: атах̣ ш́рӣ-кр̣шн̣а-на̄ма̄ди',
              path: '/slokas/brs_1_2_234.md',
            },
            {
              title: 'БРС 1.2.270: вира̄джантӣм абхивйакта̄м̇',
              path: '/slokas/brs_1_2_270.md',
            },
            {
              title: 'БРС 1.3.1: ш́уддха-саттва-виш́еша̄тма̄',
              path: '/slokas/brs_1_3_1.md',
            },
            {
              title: 'БРС 1.4.1: самйан̇ маср̣н̣ита-сва̄нто',
              path: '/slokas/brs_1_4_1.md',
            },
          ],
        },
      ],
    },
  },

  /**
   * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
   */
  plugins: [
    '@vuepress/plugin-back-to-top',
    '@vuepress/plugin-medium-zoom',
    'fulltext-search',
  ],
  markdown: {
    extendMarkdown: (md) => {
      // use more markdown-it plugins!
      md.use(require('markdown-it-html5-embed'), {})
    },
  },
}
