import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnimationCounterService {

  constructor() { }
  animateValue(startValue: number, targetValue: number, durationMs: number): Observable<number> {
    const animatedValueSubject = new BehaviorSubject<number>(startValue);
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const currentValue = Math.floor(progress * targetValue);

      animatedValueSubject.next(currentValue); 

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        animatedValueSubject.next(targetValue); 
        animatedValueSubject.complete(); 
      }
    };

    requestAnimationFrame(animate);
    return animatedValueSubject.asObservable();
  }
}