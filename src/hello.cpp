#include <opencv2/core/mat.hpp>
#include <opencv2/imgcodecs.hpp>
#include <opencv2/opencv.hpp>

#include <stdio.h>

cv::VideoCapture cam(0);
cv::Mat pic;
cv::Mat takePicture(){
    while (!cam.isOpened()) {
        std::cout << "Failed to make connection to cam" << std::endl;
        cam.open(0);
    }
    cam>>pic;
    return pic;
}
int main(){
    cv::waitKey(1000);
    cv::Mat pic1;
    pic1 = takePicture();
    imshow("camera", pic1);
    cv::waitKey();
}