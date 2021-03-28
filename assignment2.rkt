#lang racket
; ---------------------------------------------------------------------
(define append
  (lambda (list1 list2)
    (if (empty? list1)
        list2
        (cons (car list1) (append (cdr list1) list2)))))
; ---------------------------------------------------------------------
(define reverse
  (lambda (list1)
    (reverse-aux list1 '())))

(define reverse-aux
  (lambda (lst acc)
    (if (empty? lst)
        acc
        (reverse-aux (cdr lst) (cons (car lst) acc)))))
; ---------------------------------------------------------------------
(define duplicate-items
  (lambda (lst dup-count)
    (duplicate-items-aux lst dup-count 0)))

; Basically this the below function is the same as the above one, but since this is done by recursion and in
; a cyclic manner, we can not modify the dup-count array (AKA (cdr dup-count)), thus we pass each recursive call the index we need.
; The first index of course will be 0.
(define duplicate-items-aux
  (lambda (lst dup-count index)
    (if (empty? lst)
        '()
        (append (make-list (cyclic-nth dup-count index) (car lst)) (duplicate-items-aux (cdr lst) dup-count (+ 1 index))))))

; This function will give you the element in the (n % lst.length) index. 
(define cyclic-nth
  (lambda (lst n)
    (let ([a (modulo n (length lst))])
      (if (= 0 a)
          (car lst)
          (cyclic-nth (cdr lst) (- a 1))))))
; ---------------------------------------------------------------------
(define payment
  (lambda (value lst)
    (if (< value 0)
        0
        (if (= value 0)
            1
            (if (empty? lst)
                0
                (+ (payment (- value (car lst)) lst) (payment value (cdr lst))))))))
; ---------------------------------------------------------------------
(define compose-n
  (lambda (f n)
    (if (= 1 n)
        f
        (lambda (x) (f ((compose-n f (- n 1)) x))))))



(define mul8 (compose-n (lambda (x) (* 2 x)) 3))
(mul8 3)

    
