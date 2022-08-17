/**
 * 
 * @param {Element} element 元素
 * @param {} to 
 * @param {Number} duration 总时长
 */
export async function scrollTo(element, to, duration) {
  // 当前播放时间
  if (duration <= 0) return;
  // 目标-当前距离的卷曲的top，放慢下拉的速度，每隔20ms下移一次
  var difference = (to - element.scrollTop)/5;

  let count = 5
  let timer = setInterval(() => {
    element.scrollTop = element.scrollTop + difference;
    if (--count === 0)
      clearInterval(timer)
  }, count * 13)
}
