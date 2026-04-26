const str = "https://www.youtube.com/watch?v=L52sS3S4bTY&ab_channel=Haber7";
const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
console.log(str.match(regex));
