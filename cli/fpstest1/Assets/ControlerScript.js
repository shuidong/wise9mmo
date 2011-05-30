// 操作を反映する

var shortcutTextures : Texture2D[];

var selectedInventoryIndex : int ;

var com : GameObject;
var comsc;
var hero : GameObject;
var herosc;

var cursorCube : GameObject;

function Start () {
    Screen.lockCursor = true;
    //何故か機能しない    Screen.SetResolution( 1680,1050, true ); 
    
    hero = GameObject.Find( "HeroCube" );
    herosc = hero.GetComponent("HeroScript" );
    com = GameObject.Find("CommunicatorCube");
    comsc = com.GetComponent("CommunicatorScript");
    cursorCube = GameObject.Find("CursorCube");
    
    selectedInventoryIndex = 1;
}


function Update () {
    
    var mx = Input.GetAxis( "Mouse X" );
    var my = Input.GetAxis( "Mouse Y" );

    var h = Input.GetAxis( "Horizontal");
    var v = Input.GetAxis( "Vertical" );    

    herosc.Move( mx / 10.0 * -1.0 , my / 10.0, h, v );

    var j = Input.GetButton( "Jump" );
    if(j){
        if( herosc.dy == 0 ){
            herosc.dy = 4.0;
            herosc.falling = true;
			herosc.needSend = true;
            
            comsc.send("jump", herosc.dy );
        }
    }

}

var activeBoxTex : Texture2D;
var inactiveBoxTex : Texture2D;
var heartTexture : Texture2D;

var prevFireAt:float=0.0;

var multicubePrefab:GameObject;
var simpleObjPrefab:GameObject;
var charPrefab : GameObject;




// クリックしたところのブロックを壊す
function OnGUI () {

    var attackKeyHit = false;
    if( Event.current.type == EventType.KeyDown ) {
        var kn = -1;
        if( Event.current.keyCode == KeyCode.Alpha0) kn=0;
        if( Event.current.keyCode == KeyCode.Alpha1) kn=1;
        if( Event.current.keyCode == KeyCode.Alpha2) kn=2;
        if( Event.current.keyCode == KeyCode.Alpha3) kn=3;
        if( Event.current.keyCode == KeyCode.Alpha4) kn=4;
        if( Event.current.keyCode == KeyCode.Alpha5) kn=5;
        if( Event.current.keyCode == KeyCode.Alpha6) kn=6;
        if( Event.current.keyCode == KeyCode.Alpha7) kn=7;
        if( Event.current.keyCode == KeyCode.Alpha8) kn=8;
        if( Event.current.keyCode == KeyCode.Alpha9) kn=9;        
        if( kn != -1 ){
            // 選択する
            selectedInventoryIndex = kn;
        }
        if( Event.current.keyCode == KeyCode.X ) attackKeyHit = true;
    }


    // 視線の先にあるものの操作
    var cam = GameObject.Find( "Main Camera" );
    var ray = cam.camera.ScreenPointToRay( Vector3( Screen.width/2, Screen.height/2,0));

    var d = ray.direction / 30.0;

    var targetv:Vector3=Vector3(-1,-1,-1);
    var prevTargetv:Vector3=Vector3(-1,-1,-1);
    for(var i=0;i<300;i++){
        var v = ray.origin + d*i;
        var blk = comsc.getBlock( v.x , v.y, v.z );
        if( Vector3.Distance( v, ray.origin ) >4 ) break;

        var ix:int = v.x;
        var iy:int = v.y;
        var iz:int = v.z;        
        if( blk != comsc.AIR ){
            targetv = Vector3( ix,iy,iz);
            break;
        } else {
            prevTargetv = Vector3(ix,iy,iz);
        }
    }


    
    if( targetv.x != -1 ){
        print(" targetv:" + targetv );
        cursorCube.transform.position = targetv + Vector3(0.5,0.5,0.5);
    } else {
        cursorCube.transform.position = Vector3(-1,-1,-1);
    }
    
    // hit
    //    var ray = cam.camera.ScreenPointToRay( Vector3( Screen.width/2, Screen.height/2,0));
    var hitInfo : RaycastHit ;
    var mobhit = false;
    if( Physics.Raycast( cam.transform.position, ray.direction, hitInfo, 5 ) ){
        //        print("something hit!:"+ray.direction + " hitTr:" + hitInfo.transform + " p:" + hitInfo.point  + " d:" + hitInfo.distance );
        mobhit = true;
    }

        
    if( Input.GetButtonUp( "Fire1" ) || attackKeyHit ) {
        if( Time.realtimeSinceStartup > (prevFireAt + 0.2 ) ){
            prevFireAt = Time.realtimeSinceStartup;
            if( targetv.x != -1 ){
                comsc.digBlock(targetv.x,targetv.y,targetv.z);
            } else {
                comsc.attack();
            }
        }
    }
    if( Input.GetButtonDown( "Fire2" ) ) {
        print( "f2");                
    }
    if( Input.GetButtonDown( "Fire3" ) ) {

        
        if( Time.realtimeSinceStartup > ( prevFireAt + 0.2 ) ){
            var q = Instantiate( charPrefab, Vector3( 5,3,2 ), Quaternion.identity );
            q.name = "pc_1000";

            prevFireAt = Time.realtimeSinceStartup;
            print( "f3");

        }
    }

    // buttons
    for(i=0;i<shortcutTextures.length;i++){
        var ofs=0;
        if( i >=5)ofs=4;

        var btex;
        if( selectedInventoryIndex == ((i+1)%10) ){
            btex = activeBoxTex;
        } else {
            btex = inactiveBoxTex;
        }
        var unit=36;
        GUI.DrawTexture( Rect(64+i*unit+ofs,Screen.height-unit, unit,unit ), btex, ScaleMode.ScaleToFit, true, 1.0f );            
        GUI.DrawTexture( Rect(64+i*unit+ofs+2,Screen.height-32-2, 32,32 ), shortcutTextures[i], ScaleMode.StretchToFill, true, 1.0f );

        GUI.Label( Rect(64+i*unit+ofs+16, Screen.height-16-2,20,20), ""+99); // 残り個数表示
    }
    

        

    // heart
    for(i=0;i<comsc.currentHP;i++){
        unit = 18;
        GUI.DrawTexture( Rect(64+i*unit,Screen.height-36-16-4,16,16), heartTexture );
    }

    
    //    var chat = GUI.TextField( Rect(10,Screen.height-20,400,20), "chat text", 25 );
}


function drawCursorCube( vec ) {
	
    var d = 0.02;
    var v1 = vec - Vector3(d,d,d);
    var v2 = vec + Vector3(1+d,1+d,1+d);
    var v : Vector3[] = new Vector3[8];

    
    
    v[0] = Vector3( v1.x, v1.y, v1.z ); // 底面左回り
    v[1] = Vector3( v2.x, v1.y, v1.z );
    v[2] = Vector3( v2.x, v1.y, v2.z );
    v[3] = Vector3( v1.x, v1.y, v2.z );
    
    v[4] = Vector3( v1.x, v2.y, v1.z ); // 上面左回り
    v[5] = Vector3( v2.x, v2.y, v1.z );
    v[6] = Vector3( v2.x, v2.y, v2.z );
    v[7] = Vector3( v1.x, v2.y, v2.z );    

        /*        
    //	GL.PushMatrix();
	GL.Begin(GL.LINES);	

    //	GL.modelview = Matrix4x4.TRS(transform.position, transform.rotation, transform.lossyScale);

    var v1 = Vector3(0,0,0);
    var v2 = Vector3(10,10,10);
    var v3 = Vector3(0,10,0);

    GL.Vertex(v1);
    GL.Color(Color.white);
    GL.Vertex(v2);
    GL.Color(Color.white);

	GL.End();
        */

    //    GL.PushMatrix();
    
    GL.Begin(GL.LINES);
    GL.Color( Color.white );
    GL.Vertex(v[0]); GL.Vertex(v[1]); // 底面
    GL.Vertex(v[1]); GL.Vertex(v[2]);
    GL.Vertex(v[2]); GL.Vertex(v[3]);
    GL.Vertex(v[3]); GL.Vertex(v[0]);
    
    GL.Vertex(v[0]); GL.Vertex(v[4]); // 側面
    GL.Vertex(v[1]); GL.Vertex(v[5]);
    GL.Vertex(v[2]); GL.Vertex(v[6]);
    GL.Vertex(v[3]); GL.Vertex(v[7]);

    GL.Vertex(v[4]); GL.Vertex(v[0]); // 側面
    GL.Vertex(v[5]); GL.Vertex(v[1]);
    GL.Vertex(v[6]); GL.Vertex(v[2]);
    GL.Vertex(v[7]); GL.Vertex(v[3]);
    

    GL.Vertex(v[4]); GL.Vertex(v[5]); // 上面
    GL.Vertex(v[5]); GL.Vertex(v[6]);
    GL.Vertex(v[6]); GL.Vertex(v[7]);
    GL.Vertex(v[7]); GL.Vertex(v[4]);        


    GL.Vertex(v[5]); GL.Vertex(v[4]); // 上面
    GL.Vertex(v[6]); GL.Vertex(v[5]);
    GL.Vertex(v[7]); GL.Vertex(v[6]);
    GL.Vertex(v[4]); GL.Vertex(v[7]);        

    
	GL.End();
    //    	GL.PopMatrix();    
}

function OnRenderObject () {

    //    print("dddddddddd");
    //    drawCursorCube( cursorCubePos );

}
