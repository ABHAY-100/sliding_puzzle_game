"use client";

import { useEffect, useRef, useState } from "react";
import p5 from "p5";
import gsap from "gsap";
import { motion, AnimatePresence } from 'framer-motion';
import Timer from './Timer'; // Adjust the path based on your file structure
import confetti from 'canvas-confetti'; // Import confetti



interface Piece {
  pos: p5.Vector;
  img: p5.Image;
  i: number;
  correctPos: p5.Vector;
  scaledWidth: number;
  scaledHeight: number;
  scale: number; // Add scale property
  opacity: number; // Add opacity property
}

const Puzzle = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [confettiTriggered, setConfettiTriggered] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(true); // To control the timer
  const [isPuzzleCompleted, setIsPuzzleCompleted] = useState(false);
const [isConfettiLaunched, setIsConfettiLaunched] = useState(false);



  useEffect(() => {
    const sketch = (p: p5) => {
      let puzzle: PuzzleGame | undefined;
      let images: p5.Image[] = [];
      let selectedImages: string[] = [];
      let customFont: p5.Font;

      const imageSets = {
        2023: [
          "/images/2023_1.svg",
          "/images/2023_2.svg",
          "/images/2023_3.svg",
          "/images/2023_4.svg",
        ],
        2022: [
          "/images/2022_1.svg",
          "/images/2022_2.svg",
          "/images/2022_3.svg",
          "/images/2022_4.svg",
        ],
        2021: [
          "/images/2021_1.svg",
          "/images/2021_2.svg",
          "/images/2021_3.svg",
          "/images/2021_4.svg",
        ],
        2020: [
          "/images/2020_1.svg",
          "/images/2020_2.svg",
          "/images/2020_3.svg",
          "/images/2020_4.svg",
        ],
        2019: [
          "/images/2019_1.svg",
          "/images/2019_2.svg",
          "/images/2019_3.svg",
          "/images/2019_4.svg",
        ],
        2018: [
          "/images/2018_1.svg",
          "/images/2018_2.svg",
          "/images/2018_3.svg",
          "/images/2018_4.svg",
        ],
        2017: [
          "/images/2017_1.svg",
          "/images/2017_2.svg",
          "/images/2017_3.svg",
          "/images/2017_4.svg",
        ],
        2016: [
          "/images/2016_1.svg",
          "/images/2016_2.svg",
          "/images/2016_3.svg",
          "/images/2016_4.svg",
        ],
      };
      

      p.preload = () => {
        const yearKeys = Object.keys(imageSets);
        customFont = p.loadFont('/fonts/Satoshi-Regular.ttf');
        const randomYear = yearKeys[Math.floor(Math.random() * yearKeys.length)];
        selectedImages = imageSets[randomYear as unknown as keyof typeof imageSets];
        selectedImages.forEach((url) => {
          images.push(p.loadImage(url));
        });
        
      };

      p.setup = () => {
        const canvasWidth = p.windowWidth;
        const canvasHeight = p.windowHeight;

        const canvas = p.createCanvas(canvasWidth, canvasHeight);
        canvas.parent(canvasRef.current!);

        const boxSize = Math.min(400, canvasWidth * 0.8, canvasHeight * 0.8);
        const boxX = (canvasWidth - boxSize) / 2;
        const boxY = (canvasHeight - boxSize) / 2;

        puzzle = new PuzzleGame(boxX, boxY, boxSize, boxSize, images, 2); // 2x2 puzzle
      };

      p.draw = () => {
        p.clear();
        // Only draw the puzzle if it hasn't been completed
        if (!isPuzzleCompleted) {
          puzzle?.draw();
        }
      };
      

      p.mousePressed = () => {
        puzzle?.mousePressed(p.mouseX, p.mouseY);
        return false;
      };

      p.mouseDragged = () => {
        puzzle?.mouseDragged(p.mouseX, p.mouseY);
        return false;
      };

      p.mouseReleased = () => {
        puzzle?.mouseReleased();
        return false;
      };

      p.touchStarted = () => {
        p.mousePressed();
        return false;
      };

      p.touchMoved = () => {
        p.mouseDragged();
        return false;
      };

      p.touchEnded = () => {
        p.mouseReleased();
        return false;
      };

      p.windowResized = () => {
        const canvasWidth = p.windowWidth;
        const canvasHeight = p.windowHeight;

        const boxSize = Math.min(400, canvasWidth * 0.8, canvasHeight * 0.8);
        const boxX = (canvasWidth - boxSize) / 2;
        const boxY = (canvasHeight - boxSize) / 2;

        p.resizeCanvas(canvasWidth, canvasHeight);
        puzzle?.updatePosition(boxX, boxY, boxSize, boxSize);
      };


      
      class PuzzleGame {
        private pieces: Piece[] = [];
        private dragPiece: Piece | null = null;
        private isDragging = false;
        private canPlay = true;
        private clickOffset: p5.Vector = new p5.Vector(0, 0);
        private x: number;
        private y: number;
        private boxWidth: number;
        private boxHeight: number;

        constructor(
          x: number,
          y: number,
          boxWidth: number,
          boxHeight: number,
          private imgs: p5.Image[],
          private side: number
        ) {
          this.x = x;
          this.y = y;
          this.boxWidth = boxWidth;
          this.boxHeight = boxHeight;
          this.placePieces(imgs);
        }

        private placePieces(imgs: p5.Image[]) {
          this.pieces = [];
        
          const pieceWidth = this.boxWidth / this.side;
          const pieceHeight = this.boxHeight / this.side;
          const manualPositions = [
            p.createVector(this.x + pieceWidth * 0.909, this.y + pieceHeight * 0.750),
            p.createVector(this.x + pieceWidth * 1.368, this.y + pieceHeight * 0.75),
            p.createVector(this.x + pieceWidth * 0.800, this.y + pieceHeight * 1.25),
            p.createVector(this.x + pieceWidth * 1.360, this.y + pieceHeight * 1.25),
          ];
        
          for (let i = 0; i < this.side * this.side; i++) {
            const img = imgs[i];
            const correctPos = manualPositions[i];
        
            const aspectRatio = img.width / img.height;
            let scaledWidth, scaledHeight;
        
            if (aspectRatio > 1) {
              scaledWidth = pieceWidth;
              scaledHeight = pieceWidth / aspectRatio;
            } else {
              scaledHeight = pieceHeight;
              scaledWidth = pieceHeight * aspectRatio;
            }
        
            const isAbove = i < Math.floor(this.side * this.side / 2);
            const pos = this.randomPos(scaledWidth, scaledHeight, isAbove);
        
            // Initialize pieces with a position above the target area for falling effect
            const piece = {
              pos,
              img,
              i,
              correctPos,
              scaledWidth: scaledWidth * 1,  // Adjust this value to increase the size
              scaledHeight: scaledHeight * 1,  // Adjust this value to increase the size
              scale: 1,  // No need to scale for falling effect
              opacity: 0,  // Initial opacity
            };
        
            this.pieces.push(piece);
        
            // GSAP animation for falling effect
            gsap.fromTo(piece,
              {
                opacity: 0,  // Initial opacity
                y: piece.pos.y - piece.scaledHeight / 2 - 300,  // Start 300px above the final position
              },
              {
                opacity: 1,  // Fade in while falling
                y: piece.pos.y - piece.scaledHeight / 2,  // Final position
                duration: 1.2,
                ease: "power2.out",  // Smooth falling motion
                delay: i * 0.1,
                onUpdate: () => {
                  // Update the position of the piece during animation
                  piece.pos.y = Number(gsap.getProperty(piece, "y"));
                }
              }
            );
          }
        }
        
        
        
        
        private randomPos(pieceWidth: number, pieceHeight: number, isAbove: boolean) {
          // Define margins to keep pieces away from the edges of the display
          const marginX = Math.min(
            50,
            (p.windowWidth - this.boxWidth) / 2 - pieceWidth
          );
        
          const marginY = Math.min(
            50,
            (p.windowHeight - this.boxHeight) / 2 - pieceHeight
          );
        
          // Calculate random position within allowed margins
          const posX = p.random(
            Math.max(this.x - marginX, 0),
            Math.min(this.x + this.boxWidth + marginX, p.windowWidth - pieceWidth)
          );
        
          const posY = isAbove
            ? p.random(
                Math.max(150, this.y - marginY - pieceHeight),
                Math.max(0, this.y - marginY)
              )
            : p.random(
                Math.min(p.windowHeight - pieceHeight, this.y + this.boxHeight + marginY),
                // Increase the range below the canvas
                Math.min(p.windowHeight + pieceHeight * 2, this.y + this.boxHeight + marginY + pieceHeight * 2)
              );
        
          return p.createVector(posX, posY);
        }
        
        

        public draw(
          paddingHeaderX: number = 10, paddingHeaderY: number = 55, 
          paddingFooterX: number = 10, paddingFooterY: number = 20, 
          fontSizeHeader: number = 21, fontSizeFooter: number = 9
        ) {
          const responsiveTextSize = p.map(p.width, 400, 1200, fontSizeHeader, fontSizeHeader + 8);
        
          // Draw gradient box
          p.noFill();
          p.stroke(255);
          p.rect(this.x, this.y, this.boxWidth, this.boxHeight);
        
          // Gradient function
          const drawGradient = (
            x: number,
            y: number,
            width: number,
            height: number,
            colorStart: p5.Color,
            colorEnd: p5.Color
          ) => {
            for (let i = 0; i <= height; i++) {
              const inter = p.map(i, 0, height, 0, 1); // Interpolation factor (from 0 to 1)
              const col = p.lerpColor(colorStart, colorEnd, inter); // Linearly interpolate between colors
              p.stroke(col); // Set stroke color to the interpolated color
              p.line(x, y + i, x + width, y + i); // Draw a horizontal line
            }
          };
        
          p.noFill();
          p.strokeWeight(1);
          drawGradient(this.x, this.y, this.boxWidth, this.boxHeight, p.color('#C4C4C4'), p.color('#5E5E5E'));
        
          // Set responsive text properties and position for header
          p.fill(255);
          p.textFont(customFont); // Set the custom font for the rest of the text
          p.textAlign(p.LEFT, p.TOP);
          p.textSize(responsiveTextSize);
        
          const firstLine = "Can You Piece Together";
          const secondLine = "the Legacy of Excel?";
          const textHeaderX = this.x + paddingHeaderX;
          const textHeaderY = this.y - responsiveTextSize - paddingHeaderY;
        
          p.text(firstLine, textHeaderX, textHeaderY);
          p.text(secondLine, textHeaderX, textHeaderY + responsiveTextSize);
        
          p.textStyle(p.BOLD);
          const underlineStart = p.textWidth("the Legacy of ");
          const underlineLength = p.textWidth("Excel");
        
          p.stroke(255);
          p.line(
            textHeaderX + underlineStart,
            textHeaderY + responsiveTextSize * 2 + 5,
            textHeaderX + underlineStart + underlineLength,
            textHeaderY + responsiveTextSize * 2 + 5
          );
        
          // Draw puzzle pieces
          this.pieces.forEach((r) => {
            p.push();
            p.translate(r.pos.x, r.pos.y);
            p.scale(r.scale);
            p.tint(255, 255 * r.opacity);
            p.image(r.img, -r.scaledWidth / 2, -r.scaledHeight / 2, r.scaledWidth, r.scaledHeight);
            p.pop();
          });
        
          // Set responsive footer text properties and position for footer
          const madeWithText = "Made with ";
          const heartIcon = "❤‍🔥"; // Heart emoji
          const footerText = " Excel 2024";
        
          // Render "Made with" in custom font
          p.textSize(fontSizeFooter);
          p.textAlign(p.LEFT, p.BOTTOM);
          p.textFont(customFont); // Set back to custom font
          p.text(madeWithText, this.x + paddingFooterX, this.y + this.boxHeight + paddingFooterY);
        
          // Render the heart icon with default font
          const textWidthMadeWith = p.textWidth(madeWithText); // Get width of "Made with" to position heart
          p.textFont('sans-serif'); // Set to default font (or 'serif', depending on preference)
          p.text(heartIcon, this.x + paddingFooterX + textWidthMadeWith, this.y + this.boxHeight + paddingFooterY);
        
          // Render "Excel 2024" in custom font
          const textWidthHeart = p.textWidth(heartIcon); // Get width of the heart
          p.textFont(customFont); // Set back to custom font
          p.text(footerText, this.x + paddingFooterX + textWidthMadeWith + textWidthHeart, this.y + this.boxHeight + paddingFooterY);
        }
        
        
        
        
        

        public mousePressed(x: number, y: number) {
          if (this.canPlay) {
            let m = p.createVector(x, y);
            let index: number | undefined;
            this.pieces.forEach((p, i) => {
              if (this.hits(p, m)) {
                this.clickOffset = p5.Vector.sub(p.pos, m);
                this.isDragging = true;
                this.dragPiece = p;
                index = i;
              }
            });
            if (this.isDragging && index !== undefined) {
              this.putOnTop(index);
            }
          }
        }

        private hits(p: Piece, hitpos: p5.Vector) {
          return (
            hitpos.x > p.pos.x - p.scaledWidth / 2 &&
            hitpos.x < p.pos.x + p.scaledWidth / 2 &&
            hitpos.y > p.pos.y - p.scaledHeight / 2 &&
            hitpos.y < p.pos.y + p.scaledHeight / 2
          );
        }

        public mouseDragged(x: number, y: number) {
          if (this.isDragging) {
            let dragpos = p.createVector(x, y);
            this.dragPiece!.pos = p5.Vector.add(dragpos, this.clickOffset);
          }
        }

        public mouseReleased() {
          if (this.dragPiece && this.isDragging) {
            const distToCorrectPos = this.dragPiece!.pos.dist(this.dragPiece!.correctPos);
            if (distToCorrectPos < 51) {
              this.dragPiece!.pos = this.dragPiece!.correctPos.copy();
            }
            this.isDragging = false;
            this.dragPiece = null;

            if (this.isComplete()) {
              this.canPlay = false;
              setIsPuzzleCompleted(true);
              setIsTimerRunning(false);
            
              // Trigger confetti only once when the puzzle is completed
              if (!isConfettiLaunched) {
                setIsConfettiLaunched(true);
                confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: { y: 0.6 },
                });
              }
            
              // GSAP animation for pieces falling off the screen
              const tl = gsap.timeline({
                onComplete: () => {
                  setShowModal(true);
                }
              });

              this.pieces.forEach((piece, i) => {
                const targetY = p.windowHeight + piece.scaledHeight * 2;
                const randomOffsetX = (Math.random() - 0.5) * 1000;
                const targetX = piece.pos.x + randomOffsetX;

                tl.to(piece.pos, {
                  x: targetX,
                  y: targetY,
                  rotation: Math.random() * 360,
                  duration: 2,
                  ease: "power3.inOut",
                }, i * 0.1);
              });
            }
          }
        }

        

        private putOnTop(index: number) {
          const removed = this.pieces.splice(index, 1)[0];
          this.pieces.push(removed);
        }

        public updatePosition(
          x: number,
          y: number,
          boxWidth: number,
          boxHeight: number
        ) {
          this.x = x;
          this.y = y;
          this.boxWidth = boxWidth;
          this.boxHeight = boxHeight;
          this.placePieces(this.imgs);
        }

        private isComplete() {
          return this.pieces.every((p) => p.pos.equals(p.correctPos));
        }
      }
    };

    const p5Instance = new p5(sketch);

    return () => {
      p5Instance.remove();
    };
  }, [confettiTriggered]);

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      opacity: 0,
      scale: 0.8,
    },
  };
  
  const letterVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };
  
  const splitTextIntoLetters = (text: string) => {
    return text.split('').map((char, index) => (
      <motion.span
        key={index}
        variants={letterVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={{ duration: 0.03, delay: index * 0.03 }}
      >
        {char}
      </motion.span>
    ));
  };
  
  
  
  return (

    
    <div ref={canvasRef} className="relative w-full h-screen">
      <Timer isRunning={isTimerRunning} />
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="absolute inset-0 bg-opacity-60 flex items-center justify-center"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <div className="bg-white bg-opacity-30 backdrop-blur-md rounded-lg p-4 md:p-8 text-center max-w-md mx-4 sm:mx-8 shadow-lg border border-white border-opacity-30">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
                {splitTextIntoLetters("Puzzle completed! You've uncovered the past—now brace yourself, the new logo will be revealed soon...")}
              </h1>
              
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  
};

export default Puzzle;
