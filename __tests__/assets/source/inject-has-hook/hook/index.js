/**
 * @type {import("@/index").InjectHook}
 */
const hook = () => ({
  onMerging: async () => {
    return 'something';
  },
});

export default hook;
