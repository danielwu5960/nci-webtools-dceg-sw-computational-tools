source('./ScoreMethod.R')

wrapperDrawPowerp1p2 <- function(img_path,p1_t, p2_t,R0,alpha,N,k) {
	png(img_path)
	DrawPowerp1p2(p1_t, p2_t,R0,alpha,N,k)	
	invisible(dev.off())
}