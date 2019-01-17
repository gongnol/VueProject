export default {
  namespaced: true,
  state: {
    isMobile: false,
    theme: 'dark',
    layout: 'side',
    systemName: 'Dolphin Admin',
    copyright: '2018 FX Tech',
    footerLinks: [
      {link: '/', name: 'FXAdmin'},
      {link: '/', icon: 'github'},
      {link: '/', name: 'FX Tech'}
    ],
    multipage: false
  },
  mutations: {
    setDevice (state, isMobile) {
      state.isMobile = isMobile
    },
    setTheme (state, theme) {
      state.theme = theme
    },
    setLayout (state, layout) {
      state.layout = layout
    },
    setMultipage (state, multipage) {
      state.multipage = multipage
    }
  }
}
