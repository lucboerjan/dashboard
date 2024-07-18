<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tellerstands', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('datum',10)->default('0000-00-00');
            $table->decimal('dag',$precision=10, $scale=2)->default(0.00);
            $table->decimal('nacht',$precision=10, $scale=2)->default(0.00);
            $table->decimal('water',$precision=10, $scale=2)->default(0.00);
            $table->decimal('gas',$precision=10, $scale=2)->default(0.00);
            $table->decimal('zon',$precision=10, $scale=2)->default(0.00);
            $table->decimal('dagteller_in',$precision=10, $scale=2)->default(0.00);
            $table->decimal('nachtteller_in',$precision=10, $scale=2)->default(0.00);
            $table->decimal('dagteller_uit',$precision=10, $scale=2)->default(0.00);
            $table->decimal('nachtteller_uit',$precision=10, $scale=2)->default(0.00);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tellerstands');
    }
};
