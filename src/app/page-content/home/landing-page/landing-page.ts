import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SlideContent {
  title: string;
  paragraph: string;
  imageUrl: string;
}

interface PersonInfo {
  name: string;
  designation: string;
  message: string;
  imageUrl: string;
}

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css'
})

export class HeroSectionComponent implements OnInit, OnDestroy {
  currentSlide = 0;
  displayedSlide = 0; // Separate index for displayed content
  isAnimating = false;
  private intervalId: any;

  // Static person information - PM and CM
  personInfo = {
    person1: {
      name: "Narendra Modi",
      designation: "Prime Minister of India",
      message: "Digital India for all citizens",
      imageUrl: "https://m.economictimes.com/thumb/msid-100838863,width-1200,height-900,resizemode-4,imgsize-46420/modi-new-pti1.jpg"
    },
    person2: {
      name: "Dr. Manik Saha",
      designation: "Chief Minister, Tripura",
      message: "Transforming Tripura digitally",
      imageUrl: "https://st.adda247.com/https://wpassets.adda247.com/wp-content/uploads/multisite/sites/5/2022/05/15204426/EU_3tplUwAABTPR-4.jpg"
    }
  };

  slideContent: SlideContent[] = [
    {
      title: "Welcome to SWAGAT Portal",
      paragraph: "Single Window Agency for Getting Approvals and Time-bound services in Tripura. Experience seamless digital governance with our comprehensive online platform that brings all government services to your fingertips. Apply, track, and receive approvals for various certificates, licenses, and permits through one unified digital gateway designed for the citizens of Tripura.",
      imageUrl: "https://images.unsplash.com/photo-1614326014420-1f0c741ca7e1?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      title: "Digital Tripura Initiative",
      paragraph: "Join the digital revolution in Tripura with our state-of-the-art online service delivery platform. From birth certificates to business licenses, from land records to educational certificates - access over 200+ government services online. Our mission is to eliminate the need for multiple office visits and provide transparent, efficient, and time-bound services to every citizen of Tripura.",
      imageUrl: "https://images.unsplash.com/photo-1496247749665-49cf5b1022e9?q=80&w=1473&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      title: "Transparent Governance",
      paragraph: "Experience transparency like never before with real-time application tracking, automated approval workflows, and digital service delivery. Our platform ensures accountability at every step, provides clear timelines for service delivery, and maintains complete transparency in the approval process. Track your applications 24/7 and receive instant notifications on status updates through SMS and email.",
      imageUrl: "https://images.unsplash.com/photo-1528693404014-b13ebe6e723e?q=80&w=1633&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      title: "Citizen-Centric Services",
      paragraph: "Designed with citizens at the center, SWAGAT portal offers multilingual support, mobile-responsive design, and user-friendly interfaces. Whether you're applying for a domicile certificate, trade license, or any other government service, our platform ensures a smooth and hassle-free experience. Get your services delivered directly to your doorstep with our integrated courier and digital certificate delivery system.",
      imageUrl: "https://images.unsplash.com/photo-1600150806193-cf869bcfee05?q=80&w=1631&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    }
  ];

  ngOnInit() {
    this.startAutoSlide();
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  startAutoSlide() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 10000); // 10 seconds interval
  }

  stopAutoSlide() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  nextSlide() {
    const nextIndex = (this.currentSlide + 1) % this.slideContent.length;
    this.changeSlide(nextIndex);
  }

  changeSlide(index: number) {
    if (this.isAnimating || index === this.currentSlide) return;

    this.isAnimating = true;

    // Start fade out animation
    setTimeout(() => {
      // Change both image and text content simultaneously
      this.currentSlide = index;
      this.displayedSlide = index;

      // Wait a bit then fade in
      setTimeout(() => {
        this.isAnimating = false;
      }, 50);
    }, 250); // Half of the fade transition time
  }

  onSlideClick(index: number) {
    this.stopAutoSlide();
    this.changeSlide(index);
    setTimeout(() => {
      this.startAutoSlide();
    }, 100);
  }

  onButtonClick() {
    console.log('Get Started button clicked - Navigate to SWAGAT services');
    // Add navigation logic to main services page
    // Example: this.router.navigate(['/services']);
  }

  getCurrentSlide(): SlideContent {
    return this.slideContent[this.displayedSlide];
  }
}