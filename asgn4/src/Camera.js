class Camera{
    constructor(){
       this.fov = 60;

       this.eye = new Vector3([0,1,5]);
       this.at  = new Vector3([0,0,-100]);
       this.up  = new Vector3([0,1,0]);

       this.viewMatrix = new Matrix4();
       this.updateView(); 

       this.projMat = new Matrix4();
       this.projMat.setPerspective(this.fov, canvas.width/canvas.height, 0.1, 1000);
    }

    updateView(){
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2], 
            this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    }
 
    forward(){
       var f = new Vector3([0,0,0]);
       f.set(this.at);
       f.sub(this.eye);

       f = f.normalize();

       this.at = this.at.add(f.mul(0.5));
       this.eye = this.eye.add(f.mul(0.5));

       this.updateView();
    }
 
    back(){
       var f = new Vector3([0,0,0]);
       f.set(this.at);
       f.sub(this.eye);

       f = f.normalize();

       this.at = this.at.sub(f.mul(0.5));
       this.eye = this.eye.sub(f.mul(0.5));

       this.updateView();
    }
 
    left(){
       var f = new Vector3([0,0,0]);
       f.set(this.at);
       f.sub(this.eye);

       var s = new Vector3([0,0,0]);
       s.set(f);

       s = Vector3.cross(f, this.up);

       s = s.normalize();

       this.at = this.at.add(s.mul(0.25));
       this.eye = this.eye.add(s.mul(0.25));

       this.updateView();
    }
 
    right(){
       var f = new Vector3([0,0,0]);
       f.set(this.eye);
       f.sub(this.at);

       var s = new Vector3([0,0,0]);
       s.set(f);

       s = Vector3.cross(f, this.up);

       s = s.normalize();

       this.at = this.at.add(s.mul(0.25));
       this.eye = this.eye.add(s.mul(0.25));

       this.updateView();
    }
 
    panLeft(){
       var f = new Vector3([0,0,0]);
       f.set(this.at);
       f.sub(this.eye);

       var rotationMatrix = new Matrix4();
       rotationMatrix.setRotate(10, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

       var f_prime = new Vector3([0,0,0]);
       f_prime = rotationMatrix.multiplyVector3(f);

       var tempEye = new Vector3([0,0,0]);
       tempEye.set(this.eye);
       this.at = tempEye.add(f_prime);

       this.updateView();
    }
 
    panRight(){
       var f = new Vector3([0,0,0]);
       f.set(this.at);
       f.sub(this.eye);

       var rotationMatrix = new Matrix4();
       rotationMatrix.setRotate(-10, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

       var f_prime = new Vector3([0,0,0]);
       f_prime = rotationMatrix.multiplyVector3(f);

       var tempEye = new Vector3([0,0,0]);
       tempEye.set(this.eye);
       this.at = tempEye.add(f_prime);
       
       this.updateView();
    }
 
    panMLeft(deg){
       var f = new Vector3([0,0,0]);
       f.set(this.at);
       f.sub(this.eye);

       var rotationMatrix = new Matrix4();
       rotationMatrix.setRotate(deg, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

       var f_prime = new Vector3([0,0,0]);
       f_prime = rotationMatrix.multiplyVector3(f);

       var tempEye = new Vector3([0,0,0]);
       tempEye.set(this.eye);
       this.at = tempEye.add(f_prime);
       
       this.updateView();
    }
 
    panMRight(deg){
       var f = new Vector3([0,0,0]);
       f.set(this.at);
       f.sub(this.eye);

       var rotationMatrix = new Matrix4();
       rotationMatrix.setRotate(deg, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

       var f_prime = new Vector3([0,0,0]);
       f_prime = rotationMatrix.multiplyVector3(f);

       var tempEye = new Vector3([0,0,0]);
       tempEye.set(this.eye);
       this.at = tempEye.add(f_prime);
       
       this.updateView();
    }
 }